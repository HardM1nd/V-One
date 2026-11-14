from django.db.models import Count, Exists, IntegerField, OuterRef, Subquery, Value
from django.db.models.functions import Coalesce

from accounts.models import User


def _count_relation(field_name):
    relation = User._meta.get_field(field_name)
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


def with_user_summary(queryset, viewer=None):
    queryset = queryset.annotate(
        _followers_count=_count_relation("followers"),
        _following_count=_count_relation("following"),
    )
    if viewer and viewer.is_authenticated:
        queryset = queryset.annotate(
            _is_following=Exists(
                User.objects.filter(
                    pk=viewer.pk,
                    following__pk=OuterRef("pk"),
                )
            )
        )
    return queryset
