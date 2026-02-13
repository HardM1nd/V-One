from rest_framework import serializers
from django.contrib.auth import get_user_model
from post.models import Post, Comment, PostImage
from django.contrib.humanize.templatetags.humanize import naturaltime

User = get_user_model()


class CreatorSerializer(serializers.ModelSerializer):
    profile_pic = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', "username", "email", "profile_pic")
    
    def get_profile_pic(self, obj):
        """Возвращает URL профильного изображения"""
        if obj.profile_pic:
            try:
                return obj.profile_pic.url
            except Exception:
                return ""
        return ""


class CommentSerializer(serializers.ModelSerializer):
    creator = CreatorSerializer(read_only=True)
    created = serializers.SerializerMethodField(read_only=True)
    created_at = serializers.DateTimeField(source="created", read_only=True)
    post_id = serializers.SerializerMethodField()
    post_content = serializers.SerializerMethodField()
    post_creator_profile = serializers.SerializerMethodField()
    post_creator = serializers.SerializerMethodField()
    post_created = serializers.SerializerMethodField()
    post_created_at = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        exclude = ('post',)

    def create(self, validated_data):
        post_id = self.context.get('post_id')
        post = Post.objects.get(id=post_id)
        validated_data['post'] = post
        validated_data['creator'] = self.context.get("request").user
        return super().create(validated_data)

    def get_created(self, comment):
        return naturaltime(comment.created)

    def get_post_id(self, comment):
        return comment.post.id

    def get_post_content(self, comment):
        return comment.post.content

    def get_post_creator_profile(self, comment):
        creator = comment.post.creator
        try:
            if creator.profile_pic:
                return creator.profile_pic.url
        except Exception:
            pass
        return None

    def get_post_creator(self, comment):
        return comment.post.creator.username

    def get_post_created(self, comment):
        return naturaltime(comment.post.created)

    def get_post_created_at(self, comment):
        return comment.post.created.isoformat()


class PostSerializer(serializers.ModelSerializer):
    creator = CreatorSerializer(read_only=True)
    likes = serializers.SerializerMethodField(read_only=True)
    is_liked = serializers.SerializerMethodField(read_only=True)
    is_commented = serializers.SerializerMethodField(read_only=True)
    is_saved = serializers.SerializerMethodField(read_only=True)
    comments = serializers.SerializerMethodField()
    saves = serializers.SerializerMethodField()
    created = serializers.SerializerMethodField(read_only=True)
    created_at = serializers.DateTimeField(source="created", read_only=True)
    is_following_user = serializers.SerializerMethodField(read_only=True)
    is_followed_by_user = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Post
        fields = (
            "id",
            'creator',
            'likes',
            'is_liked',
            'image',
            'content',
            'created',
            'created_at',
            'comments',
            'saves',
            'is_saved',
            'is_commented',
            'is_following_user',
            'is_followed_by_user',
            "isEdited"
        )
    
    def to_representation(self, instance):
        """Переопределяем представление для правильного формирования URL изображения"""
        representation = super().to_representation(instance)
        
        # Собираем все изображения поста (из PostImage и старое поле image для обратной совместимости)
        images = []
        
        # Добавляем изображения из PostImage
        for post_image in instance.images.all():
            try:
                if post_image.image and hasattr(post_image.image, 'url'):
                    image_url = post_image.image.url
                    if image_url and image_url.strip():
                        images.append(image_url)
            except (ValueError, AttributeError):
                pass
        
        # Если есть старое поле image (для обратной совместимости), добавляем его первым
        if instance.image and hasattr(instance.image, 'url'):
            try:
                image_url = instance.image.url
                if image_url and image_url.strip():
                    # Добавляем в начало, если его еще нет в списке
                    if image_url not in images:
                        images.insert(0, image_url)
            except (ValueError, AttributeError):
                pass
        
        # Возвращаем массив изображений (или одно изображение для обратной совместимости)
        if len(images) == 0:
            representation['image'] = ""
        elif len(images) == 1:
            # Для обратной совместимости: если одно изображение, возвращаем строку
            representation['image'] = images[0]
        else:
            # Если несколько изображений, возвращаем массив
            representation['image'] = images
        
        return representation

    def get_created(self, post):
        return naturaltime(post.created)

    def get_is_liked(self, post):
        user = self.context.get("request").user
        if not user or not user.is_authenticated:
            return False
        return post.likes.filter(id=user.id).exists()

    def get_is_saved(self, post):
        user = self.context.get("request").user
        if not user or not user.is_authenticated:
            return False
        return post.saves.filter(id=user.id).exists()

    def get_is_commented(self, post):
        user = self.context.get("request").user
        if not user or not user.is_authenticated:
            return False
        return post.comments.filter(creator=user).exists()

    def get_likes(self, post):
        return post.likes.count()

    def get_is_following_user(self, post):
        creator = post.creator
        user = self.context.get("request").user
        if not user or not user.is_authenticated:
            return False
        return user.following.filter(id=creator.id).exists()

    def get_is_followed_by_user(self, post):
        creator = post.creator
        user = self.context.get("request").user
        if not user or not user.is_authenticated:
            return False
        return creator.following.filter(id=user.id).exists()

    def get_comments(self, post):
        return post.comments.count()

    def get_saves(self, post):
        return post.saves.count()

    def create(self, validated_data):
        user = self.context.get("request").user
        validated_data["creator"] = validated_data.get('creator', user)
        
        # Получаем файлы из request.FILES
        request = self.context.get("request")
        files = request.FILES.getlist('image') if request else []
        
        # Сохраняем первое изображение в старое поле image для обратной совместимости
        if files:
            validated_data['image'] = files[0]
        
        # Создаем пост
        post = super().create(validated_data)
        
        # Сохраняем все остальные изображения в PostImage
        for index, file in enumerate(files[1:], start=1):
            PostImage.objects.create(
                post=post,
                image=file,
                order=index
            )
        
        return post
