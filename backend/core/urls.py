from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryListView,
    DishListView,
    OrderListCreateView,
    ReviewViewSet
)

router = DefaultRouter()
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('dishes/', DishListView.as_view(), name='dish-list'),
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('', include(router.urls)),
]