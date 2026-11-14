from django.db.models import BooleanField, Count, Exists, IntegerField, OuterRef, Subquery, Value
from django.db.models.functions import Coalesce

from accounts.models import User
from post.models import Comment, Post


def _count_related(queryset, parent_field):
    count = (
        queryset.order_by()
        .values(parent_field)
        .annotate(total=Count("pk"))
        .values("total")[:1]
    )
    return Coalesce(
        Subquery(count, output_field=IntegerField()),
        Value(0),
        output_field=IntegerField(),
    )


def count_many_to_many(model, field_name):
    relation = model._meta.get_field(field_name)
    through_model = relation.remote_field.through
    source_field = relation.m2m_field_name()
    queryset = (
        through_model.objects.filter(
            **{f"{source_field}_id": OuterRef("pk")}
        )
        .order_by()
        .values(source_field)
        .annotate(total=Count("pk"))
        .values("total")[:1]
    )
    return Coalesce(
        Subquery(queryset, output_field=IntegerField()),
        Value(0),
        output_field=IntegerField(),
    )


def with_post_list_data(queryset, user=None):
    queryset = queryset.select_related("creator").prefetch_related("images").annotate(
        _likes_count=count_many_to_many(Post, "likes"),
        _saves_count=count_many_to_many(Post, "saves"),
        _comments_count=_count_related(Comment.objects.all(), "post_id"),
    )

    if user and user.is_authenticated:
        queryset = queryset.annotate(
            _is_liked=Exists(user.liked_post.filter(pk=OuterRef("pk"))),
            _is_saved=Exists(user.saved_post.filter(pk=OuterRef("pk"))),
            _is_commented=Exists(
                Comment.objects.filter(post_id=OuterRef("pk"), creator_id=user.pk)
            ),
            _is_following_user=Exists(
                User.objects.filter(
                    pk=user.pk,
                    following__pk=OuterRef("creator_id"),
                )
            ),
            _is_followed_by_user=Exists(
                User.objects.filter(
                    pk=OuterRef("creator_id"),
                    following__pk=user.pk,
                )
            ),
        )
    else:
        queryset = queryset.annotate(
            _is_liked=Value(False, output_field=BooleanField()),
            _is_saved=Value(False, output_field=BooleanField()),
            _is_commented=Value(False, output_field=BooleanField()),
            _is_following_user=Value(False, output_field=BooleanField()),
            _is_followed_by_user=Value(False, output_field=BooleanField()),
        )

    return queryset
