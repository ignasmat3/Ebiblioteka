from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.core.cache import cache
from rest_framework.exceptions import AuthenticationFailed
from django.http import JsonResponse
from .models import UserSession

class TokenRefreshMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Ignore requests that do not need authentication
        if request.path.startswith('/admin') or request.path.startswith('/swagger'):
            return

        # Get the tokens from cookies
        refresh_token = request.COOKIES.get('refresh_token')
        access_token_raw = request.COOKIES.get('access_token')

        if not refresh_token or not access_token_raw:
            return

        try:
            # Decode the access token to check its validity
            access_token = AccessToken(access_token_raw)
            if cache.get(f"blacklist_{access_token['jti']}"):
                raise AuthenticationFailed("Access token is blacklisted.")
            return  # Token is valid; let the request proceed
        except Exception:
            pass  # Access token is invalid or expired; refresh it

        try:
            # Manually validate the refresh token
            refresh = RefreshToken(refresh_token)
            if cache.get(f"blacklist_{refresh['jti']}"):
                raise AuthenticationFailed("Refresh token is blacklisted.")

            # Create a new access token
            new_access_token = refresh.access_token
            user_id = refresh['user_id']
            user_session = UserSession.objects.get(refresh_token=refresh_token, user_id=user_id, expired=False)

            # Inject the new access token into the Authorization header
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {new_access_token}'

        except Exception as e:
            return JsonResponse({'error': 'Invalid or expired tokens.'}, status=401)
