from rest_framework import serializers
from .models import User, Category, Dish, Order, OrderItem, Review

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class DishSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Dish
        fields = [
            'id', 'name', 'description', 'price', 
            'category', 'category_name', 'is_active', 'is_available'
        ]

class OrderItemSerializer(serializers.ModelSerializer):
    dish_details = DishSerializer(source='dish', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'dish', 'dish_details', 'quantity', 'unit_price']
        read_only_fields = ['unit_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'status', 'items', 
            'created_at', 'notes', 'total_amount'
        ]
        read_only_fields = ['total_amount']

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'order', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        """
        Logica dinamica: sblocco recensioni basato sullo stato dell'ordine.
        """
        order = data['order']

        # 1. Controllo stato: solo ordini consegnati
        if order.status != 'delivered':
            raise serializers.ValidationError(
                "Accesso negato: puoi recensire l'ordine solo dopo la consegna."
            )

        # 2. Vincolo di unicità: una recensione per ordine
        if hasattr(order, 'review'):
            raise serializers.ValidationError(
                "Errore: Hai già lasciato una recensione per questo ordine."
            )

        return data