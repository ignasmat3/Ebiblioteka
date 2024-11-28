from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .models import User, Book, Category, Comment, Reservation

class APITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # User data
        self.user_data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "TestPassword123!",
            "password2": "TestPassword123!"
        }

        # Admin user data
        self.admin_data = {
            "username": "adminuser",
            "email": "admin@example.com",
            "password": "AdminPassword123!",
            "password2": "AdminPassword123!"
        }

        # Category data
        self.category_data = {
            "name": "Test Category"
        }

        # Book data
        self.book_data = {
            "title": "Test Book",
            "author": "Author Name",
            "description": "A test book description."
            # 'category' will be added after creating a category
        }

        # Comment data
        self.comment_data = {
            "text": "This is a test comment."
        }

        # Create a category for books
        self.category = Category.objects.create(name="Test Category")
        self.book_data['category'] = self.category.id

    def authenticate_user(self):
        # Register user
        self.client.post(reverse('user-create'), self.user_data)
        # Obtain token
        response = self.client.post(reverse('token_obtain_pair'), {
            "username": self.user_data['username'],
            "password": self.user_data['password']
        })
        self.user_access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.user_access_token)

    def authenticate_admin(self):
        # Register admin user
        self.client.post(reverse('user-create'), self.admin_data)
        # Promote to admin
        admin_user = User.objects.get(username=self.admin_data['username'])
        admin_user.role = 'admin'
        admin_user.save()
        # Obtain token
        response = self.client.post(reverse('token_obtain_pair'), {
            "username": self.admin_data['username'],
            "password": self.admin_data['password']
        })
        self.admin_access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.admin_access_token)

    def test_user_registration(self):
        response = self.client.post(reverse('user-create'), self.user_data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['detail'], "User created successfully.")

    def test_admin_registration_and_promotion(self):
        response = self.client.post(reverse('user-create'), self.admin_data)
        self.assertEqual(response.status_code, 201)
        # Promote to admin
        admin_user = User.objects.get(username=self.admin_data['username'])
        admin_user.role = 'admin'
        admin_user.save()
        self.assertEqual(admin_user.role, 'admin')

    def test_token_obtain(self):
        self.test_user_registration()  # Ensure user is registered
        response = self.client.post(reverse('token_obtain_pair'), {
            "username": self.user_data['username'],
            "password": self.user_data['password']
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['role'], 'guest')

    def test_access_protected_endpoint_without_authentication(self):
        response = self.client.get(reverse('book-list-create'))
        self.assertEqual(response.status_code, 200)  # Allowed for GET requests

        # Attempt to create a book without authentication
        response = self.client.post(reverse('book-list-create'), self.book_data)
        self.assertEqual(response.status_code, 403)

    def test_user_cannot_create_book(self):
        self.authenticate_user()
        response = self.client.post(reverse('book-list-create'), self.book_data)
        self.assertEqual(response.status_code, 403)

    def test_admin_can_create_book(self):
        self.authenticate_admin()
        response = self.client.post(reverse('book-list-create'), self.book_data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['title'], self.book_data['title'])

    def test_user_can_create_comment(self):
        self.authenticate_user()
        # First, create a book as admin
        self.authenticate_admin()
        response = self.client.post(reverse('book-list-create'), self.book_data)
        book_id = response.data['id']
        # Switch back to user
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.user_access_token)
        # User creates a comment
        response = self.client.post(reverse('book-comments', args=[book_id]), self.comment_data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['text'], self.comment_data['text'])

    def test_user_cannot_create_category(self):
        self.authenticate_user()
        response = self.client.post(reverse('category-list-create'), self.category_data)
        self.assertEqual(response.status_code, 403)

    def test_admin_can_create_category(self):
        self.authenticate_admin()
        response = self.client.post(reverse('category-list-create'), self.category_data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['detail'], 'Category created successfully.')

    def test_user_can_make_reservation(self):
        self.authenticate_user()
        # Ensure there is a book to reserve
        self.authenticate_admin()
        response = self.client.post(reverse('book-list-create'), self.book_data)
        book_id = response.data['id']
        # Switch back to user
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.user_access_token)
        reservation_data = {
            'book': book_id,
            'status': 'reserved'
        }
        response = self.client.post(reverse('reservation-list-create'), reservation_data)
        self.assertEqual(response.status_code, 201)

    def test_admin_can_view_all_reservations(self):
        self.authenticate_admin()
        response = self.client.get(reverse('reservation-list-create'))
        self.assertEqual(response.status_code, 200)

    def test_user_can_view_own_reservations(self):
        self.authenticate_user()
        response = self.client.get(reverse('reservation-list-create'))
        self.assertEqual(response.status_code, 200)

    def test_user_cannot_view_other_users_reservations(self):
        self.authenticate_user()
        # Another user makes a reservation
        other_user_data = {
            "username": "otheruser",
            "email": "otheruser@example.com",
            "password": "OtherPassword123!",
            "password2": "OtherPassword123!"
        }
        self.client.post(reverse('user-create'), other_user_data)
        response = self.client.post(reverse('token_obtain_pair'), {
            "username": other_user_data['username'],
            "password": other_user_data['password']
        })
        other_user_access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + other_user_access_token)
        # Other user makes a reservation
        self.authenticate_admin()
        response = self.client.post(reverse('book-list-create'), self.book_data)
        book_id = response.data['id']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + other_user_access_token)
        reservation_data = {
            'book': book_id,
            'status': 'reserved'
        }
        self.client.post(reverse('reservation-list-create'), reservation_data)
        # Switch back to original user
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.user_access_token)
        # User attempts to view all reservations
        response = self.client.get(reverse('reservation-list-create'))
        # Should only see own reservations (which are none)
        self.assertEqual(len(response.data), 0)

    def test_user_cannot_delete_other_users_comment(self):
        self.authenticate_user()
        # Create a book and comment as another user
        self.authenticate_admin()
        response = self.client.post(reverse('book-list-create'), self.book_data)
        book_id = response.data['id']
        comment_data = {
            "text": "Admin's comment."
        }
        response = self.client.post(reverse('book-comments', args=[book_id]), comment_data)
        comment_id = response.data['id']
        # Switch back to original user
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.user_access_token)
        # Attempt to delete the comment
        response = self.client.delete(reverse('comment-detail', args=[comment_id]))
        self.assertEqual(response.status_code, 403)

    def test_admin_can_delete_any_comment(self):
        self.authenticate_user()
        # User creates a comment
        self.authenticate_admin()
        response = self.client.post(reverse('book-list-create'), self.book_data)
        book_id = response.data['id']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.user_access_token)
        response = self.client.post(reverse('book-comments', args=[book_id]), self.comment_data)
        comment_id = response.data['id']
        # Admin deletes the comment
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.admin_access_token)
        response = self.client.delete(reverse('comment-detail', args=[comment_id]))
        self.assertEqual(response.status_code, 204)

    def test_user_cannot_access_user_list(self):
        self.authenticate_user()
        response = self.client.get(reverse('user-list'))
        self.assertEqual(response.status_code, 403)

    def test_admin_can_access_user_list(self):
        self.authenticate_admin()
        response = self.client.get(reverse('user-list'))
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)  # At least one user exists

    def test_user_can_update_own_profile(self):
        self.authenticate_user()
        update_data = {
            "email": "updatedemail@example.com"
        }
        response = self.client.put(reverse('user-update-delete', args=[self.user.id]), update_data)
        self.assertEqual(response.status_code, 200)
        user = User.objects.get(id=self.user.id)
        self.assertEqual(user.email, "updatedemail@example.com")

    def test_user_cannot_update_other_user_profile(self):
        self.authenticate_user()
        other_user_data = {
            "username": "otheruser",
            "email": "otheruser@example.com",
            "password": "OtherPassword123!",
            "password2": "OtherPassword123!"
        }
        # Create another user
        self.client.post(reverse('user-create'), other_user_data)
        other_user = User.objects.get(username="otheruser")
        # Attempt to update other user's profile
        update_data = {
            "email": "hackedemail@example.com"
        }
        response = self.client.put(reverse('user-update-delete', args=[other_user.id]), update_data)
        self.assertEqual(response.status_code, 403)

    def test_admin_can_update_any_user_profile(self):
        self.authenticate_admin()
        # Update test user's email
        update_data = {
            "email": "adminupdatedemail@example.com"
        }
        test_user = User.objects.get(username=self.user_data['username'])
        response = self.client.put(reverse('user-update-delete', args=[test_user.id]), update_data)
        self.assertEqual(response.status_code, 200)
        test_user.refresh_from_db()
        self.assertEqual(test_user.email, "adminupdatedemail@example.com")
