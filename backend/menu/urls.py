from django.urls import path
from .views import (
    category_list,
    category_create,
    category_update,
    category_delete,
    menu_view,
    dish_create,
    dish_detail,
    dish_update,
    dish_delete
)

urlpatterns = [
    # ==========================================
    # Categories
    # ==========================================
    path('categories/', category_list, name='category-list'),
    path('categories/add/', category_create, name='category-create'),
    path('categories/<uuid:id>/edit/', category_update, name='category-update'),
    path('categories/<uuid:id>/delete/', category_delete, name='category-delete'),

    # ==========================================
    # Dishes
    # ==========================================
    path('view/', menu_view, name='menu-view'),
    path('dishes/add/', dish_create, name='dish-create'),
    path('dishes/<uuid:id>/', dish_detail, name='dish-detail'),
    path('dishes/<uuid:id>/edit/', dish_update, name='dish-update'),
    path('dishes/<uuid:id>/delete/', dish_delete, name='dish-delete'),
]