from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Dish, Category
from .serializers import DishSerializer, CategorySerializer

# ==========================================
# CATEGORY MANAGEMENT
# ==========================================

@api_view(['GET'])
def category_list(request):
    """
    Returns all categories.
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
    return Response({"message": "Category successfully deleted."}, status=204)


# ==========================================
# DISH MANAGEMENT
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def menu_view(request):
    """
    Returns the list of active dishes in the menu.
    Supports filters via Query Params:
    - ?category=<id>
    - ?is_available=true/false
    - ?has_allergens=true/false
    """
    dishes = Dish.objects.filter(is_active=True)

    category_id = request.query_params.get('category')
    if category_id:
        dishes = dishes.filter(category__id=category_id)

    is_available = request.query_params.get('is_available')
    if is_available is not None:
        is_available_bool = is_available.lower() == 'true'
        dishes = dishes.filter(is_available=is_available_bool)

    has_allergens = request.query_params.get('has_allergens')
    if has_allergens is not None:
        has_allergens_bool = has_allergens.lower() == 'true'
        dishes = dishes.filter(has_allergens=has_allergens_bool)

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
    Returns the details of a single dish.
    """
    dish = get_object_or_404(Dish, pk=id)
    serializer = DishSerializer(dish)
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
def dish_update(request, id):
    """
    Updates the data of an existing dish.
    """
    dish = get_object_or_404(Dish, pk=id)
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
    return Response({"message": "Dish successfully deactivated."}, status=204)



