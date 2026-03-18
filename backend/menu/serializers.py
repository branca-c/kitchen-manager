from rest_framework import serializers
from .models import Category, Dish

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        # Admin only enters the name
        fields = ['id', 'name']

class DishSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dish
        # All fields needed to manage the dish
        fields = [
            'id', 
            'name', 
            'description', 
            'price', 
            'category', 
            'ingredients', 
            'has_allergens', 
            'is_active',
            'is_available'
        ]
