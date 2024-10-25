from django.test import TestCase
from .models import User, Book, Reservation, Comment

class UserDeletionTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(username='testuser', email='testuser@example.com', role='reader')
        self.book = Book.objects.create(title='Test Book', author='Author', description='Test Description', category='Fiction')
        self.reservation = Reservation.objects.create(book=self.book, user=self.user)
        self.comment = Comment.objects.create(book=self.book, user=self.user, text='Great book!')

    def test_user_deletion(self):
        # Delete the user
        self.user.delete()

        # Check that the reservation and comment are also deleted
        self.assertFalse(Reservation.objects.filter(id=self.reservation.id).exists())
        self.assertFalse(Comment.objects.filter(id=self.comment.id).exists())
