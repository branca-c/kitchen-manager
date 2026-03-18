from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from .services import AIService
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
        # Il cliente vede solo i propri feedback, l'admin vede tutto
        user = self.request.user
        if user.role == 'admin': 
            return Review.objects.all()
        return Review.objects.filter(order__user=user)

    def perform_create(self, serializer):
        # Verifica che l'ordine appartenga all'utente e sia 'delivered'
        order = serializer.validated_data['order']
        
        if order.user != self.request.user:
            raise PermissionDenied("Non puoi recensire un ordine non tuo.")
            from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from .services import AIService
from .models import Category, Dish, Order, Review
from .serializers import (
    CategorySerializer,
    DishSerializer,
    OrderSerializer,
    ReviewSerializer
)

# --- BLOCCO MENU (Marika) ---
class CategoryListView(generics.ListAPIView):
    """
    Visualizzazione pubblica del menu.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class DishListView(generics.ListAPIView):
    """
    Visualizzazione pubblica dei piatti attivi.
    """
    queryset = Dish.objects.filter(is_active=True)
    serializer_class = DishSerializer
    permission_classes = [permissions.AllowAny]


# --- BLOCCO ORDINI (Chiara) ---
class OrderListCreateView(generics.ListCreateAPIView):
    """
    Gestione ordini: i clienti vedono i propri, l'admin vede tutto.
    """
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
        # Il cliente vede solo i propri feedback, l'admin vede tutto
        user = self.request.user
        if user.role == 'admin': 
            return Review.objects.all()
        return Review.objects.filter(order__user=user)

    def perform_create(self, serializer):
        # Verifica che l'ordine appartenga all'utente e sia in stato 'delivered'
        order = serializer.validated_data['order']
        
        if order.user != self.request.user:
            raise PermissionDenied("Non puoi recensire un ordine non tuo.")
            
        if order.status != 'delivered':
            raise PermissionDenied("Puoi recensire l'ordine solo dopo la consegna (stato: delivered).")
            
        serializer.save()

    @action(detail=False, methods=['get'], url_path='ai-summary')
    def ai_summary(self, request):
        """
        Endpoint AI riservato all'Admin per la sintesi delle recensioni.
        Interroga AIService per ottenere un'analisi tramite Gemini 2.5 Flash.
        """
        # Protezione accesso: solo ruolo admin ammesso
        if request.user.role != 'admin':
            return Response(
                {"detail": "Accesso negato. Funzionalità riservata all'amministratore."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Recupero di tutti i commenti per l'analisi
        reviews = Review.objects.all()
        if reviews.count() < 3:
            return Response(
                {"detail": "Dati insufficienti: servono almeno 3 recensioni per avviare l'IA."}, 
                status=status.HTTP_200_OK
            )

        # Chiamata al servizio reale dell'IA
        analysis = AIService.analyze_reviews(reviews)

        return Response({
            "status": "Analisi Reale Completata",
            "provider": "Gemini 2.5 Flash",
            "results": analysis
        })
        if order.status != 'delivered':
            raise PermissionDenied("Puoi recensire l'ordine solo dopo la consegna (stato: delivered).")
            
        serializer.save()

    @action(detail=False, methods=['get'], url_path='ai-summary')
    def ai_summary(self, request):
        """
        Endpoint AI riservato all'Admin per la sintesi delle recensioni.
        Utilizza AIService per connettersi a Gemini.
        """
        # Protezione accesso: solo ruolo admin ammesso
        if request.user.role != 'admin':
            return Response(
                {"detail": "Accesso negato. Funzionalità riservata all'amministratore."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Recupero di tutti i commenti per l'analisi
        reviews = Review.objects.all()
        if reviews.count() < 3:
            return Response(
                {"detail": "Dati insufficienti: servono almeno 3 recensioni per avviare l'IA."}, 
                status=status.HTTP_200_OK
            )

        # Chiamata al servizio reale dell'IA
        analysis = AIService.analyze_reviews(reviews)

        return Response({
            "status": "Analisi Reale Completata",
            "provider": "Gemini 2.5 Flash",
            "results": analysis
        })