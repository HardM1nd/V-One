from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Comment, Post


class PublicPostAccessTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        creator = user_model.objects.create_user(
            username="post-author",
            password="secure-password-123",
        )
        self.post = Post.objects.create(creator=creator, content="Public post")
        Comment.objects.create(
            creator=creator,
            post=self.post,
            content="Public comment",
        )

    def test_anonymous_user_can_read_posts(self):
        response = self.client.get("/api/post/all/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_anonymous_user_can_read_post_details_and_comments(self):
        detail_response = self.client.get(f"/api/post/{self.post.id}/")
        comments_response = self.client.get(f"/api/post/{self.post.id}/comments/")

        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(comments_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(comments_response.data["results"]), 1)

    def test_explore_orders_by_engagement_and_keeps_post_response_fields(self):
        supporter = get_user_model().objects.create_user(
            username="post-supporter",
            password="secure-password-123",
        )
        popular_post = Post.objects.create(
            creator=self.post.creator,
            content="Popular post",
        )
        popular_post.likes.add(supporter)
        popular_post.saves.add(supporter)

        response = self.client.get("/api/post/all/?filter=explore")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["id"], popular_post.id)
        self.assertEqual(
            set(response.data["results"][0]),
            {
                "id",
                "creator",
                "likes",
                "is_liked",
                "image",
                "content",
                "created",
                "created_at",
                "comments",
                "saves",
                "is_saved",
                "is_commented",
                "is_following_user",
                "is_followed_by_user",
                "isEdited",
            },
        )

    def test_anonymous_user_cannot_interact_with_posts(self):
        urls = [
            f"/api/post/{self.post.id}/like/",
            f"/api/post/{self.post.id}/save/",
            f"/api/post/{self.post.id}/comments/create/",
        ]

        for url in urls:
            with self.subTest(url=url):
                response = self.client.post(url, {"content": "Guest comment"})
                self.assertEqual(
                    response.status_code,
                    status.HTTP_401_UNAUTHORIZED,
                )
