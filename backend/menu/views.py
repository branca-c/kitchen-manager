from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Dish, Category
from .serializers import DishSerializer, CategorySerializer

# ==========================================
# CATEGORY MANAGEMENT
# ==========================================

@api_view(['GET'])
def category_list(request):
    """
    Returns all entered categories.
    """
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def category_create(request):
    """
    Adds a new category.
    """
    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['PUT', 'PATCH'])
def category_update(request, id):
    """
    Renames or modifies an existing category.
    """
    category = get_object_or_404(Category, pk=id)
    partial = request.method == 'PATCH'
    serializer = CategorySerializer(category, data=request.data, partial=partial)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
def category_delete(request, id):
    """
    Permanently deletes a category from the DB.
    WARNING: All connected dishes will also be deleted (on_delete=CASCADE).
    """
    category = get_object_or_404(Category, pk=id)
    category.delete()
    return Response({"message": "Category deleted successfully."}, status=204)


# ==========================================
# DISH MANAGEMENT
# ==========================================

@api_view(['GET'])
def menu_view(request):
    """
    Returns the list of active dishes in the menu.
    Supports filters via Query Params:
    - ?category=<id>
    - ?available=true/false
    - ?allergens=true/false
    """
    # Start from all active dishes
    dishes = Dish.objects.filter(is_active=True)

    # Category Filter
    category_id = request.query_params.get('category')
    if category_id:
        dishes = dishes.filter(category__id=category_id)

    # Availability Filter
    available = request.query_params.get('available')
    if available is not None:
        # Converts string 'true' / 'false' to boolean
        available_bool = available.lower() == 'true'
        dishes = dishes.filter(is_available=available_bool)

    # Allergens Filter
    allergens = request.query_params.get('allergens')
    if allergens is not None:
        allergens_bool = allergens.lower() == 'true'
        dishes = dishes.filter(has_allergens=allergens_bool)

    serializer = DishSerializer(dishes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def dish_create(request):
    """
    Adds a new dish to the database.
    """
    serializer = DishSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def dish_detail(request, id):
    """
    Returns details of a single dish.
    """
    dish = get_object_or_404(Dish, pk=id)
    serializer = DishSerializer(dish)
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
def dish_update(request, id):
    """
    Updates data of an existing dish.
    """
    dish = get_object_or_404(Dish, pk=id)
    # partial=True allows omitting fields in PATCH requests
    partial = request.method == 'PATCH'
    serializer = DishSerializer(dish, data=request.data, partial=partial)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
def dish_delete(request, id):
    """
    Performs a Soft Delete: sets the dish as inactive instead of removing it from the DB.
    """
    dish = get_object_or_404(Dish, pk=id)
    dish.is_active = False
    dish.is_available = False
    dish.save()
    return Response({"message": "Dish deactivated successfully."}, status=204)


