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
    path('categories/', category_list, name='category_list'),
    path('categories/create/', category_create, name='category_create'),
    path('categories/<uuid:id>/update/', category_update, name='category_update'),
    path('categories/<uuid:id>/delete/', category_delete, name='category_delete'),

    # ==========================================
    # Dishes
    # ==========================================
    path('menu/', menu_view, name='menu_view'),
    path('dishes/create/', dish_create, name='dish_create'),
    path('dishes/<uuid:id>/', dish_detail, name='dish_detail'),
    path('dishes/<uuid:id>/update/', dish_update, name='dish_update'),
    path('dishes/<uuid:id>/delete/', dish_delete, name='dish_delete'),
]