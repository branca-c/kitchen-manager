from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
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
        """
        Analisi AI delle recensioni riservata all'Admin[cite: 240, 304, 379].
        """
        if request.user.role != 'admin':
            return Response(
                {"detail": "Accesso riservato all'amministratore."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        comments = Review.objects.all().values_list('comment', flat=True)
        
        # Simulazione integrazione AI (es: Lyria 3) [cite: 217, 381]
        return Response({
            "status": "Analisi AI completata",
            "summary": "I clienti apprezzano la qualità dei piatti, ma suggeriscono di migliorare il packaging.",
            "total_reviews": len(comments)
        })