from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from .services import AIService # il servizio AI
from .models import Category, Dish, Order, Review
from .serializers import (
    CategorySerializer,
    DishSerializer,
    OrderSerializer,
    ReviewSerializer
)

# --- BLOCCO MENU (Marika) ---
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class DishListView(generics.ListAPIView):
    queryset = Dish.objects.filter(is_active=True)
    serializer_class = DishSerializer
    permission_classes = [permissions.AllowAny]


# --- BLOCCO ORDINI (Chiara) ---
class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Order.objects.all()
        return Order.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# --- BLOCCO RECENSIONI & AI (Isabelle) ---
class ReviewViewSet(viewsets.ModelViewSet):
    """
    Gestisce il ciclo di vita delle recensioni e l'analisi AI per l'Admin.
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Il cliente vede solo i propri feedback, l'admin vede tutto [cite: 237, 238]
        user = self.request.user
        if user.role == 'admin': 
            return Review.objects.all()
        return Review.objects.filter(order__user=user)

    def perform_create(self, serializer):
        # Verifica che l'ordine appartenga all'utente [cite: 214, 237]
        order = serializer.validated_data['order']
        if order.user != self.request.user:
            raise PermissionDenied("Non puoi recensire un ordine non tuo.")
        serializer.save()

    
    @action(detail=False, methods=['get'], url_path='ai-summary')
    def ai_summary(self, request):
        if request.user.role != 'admin':
            return Response({"detail": "Negato"}, status=403)
        
        reviews = Review.objects.all()
        if reviews.count() < 3:
            return Response({"detail": "Dati insufficienti"}, status=200)

        # Usiamo il servizio esterno!
        analysis = AIService.analyze_reviews(reviews)

        return Response({
            "status": "Analisi Reale Completata",
            "provider": "Gemini 3 Flash",
            "results": analysis
        })

      