from django.test import TestCase

# Create your tests here.
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Order, Review

User = get_user_model()

class ReviewSecurityTests(APITestCase):
    def setUp(self):
        # Creazione Utenti
        self.admin = User.objects.create_user(username='admin_boss', password='password123', role='admin')
        self.user_a = User.objects.create_user(username='utente_a', password='password123', role='customer')
        self.user_b = User.objects.create_user(username='utente_b', password='password123', role='customer')
        
        # Creazione Ordine consegnato per Utente A
        self.order_a = Order.objects.create(user=self.user_a, status='delivered', total_amount=25.0)
        # Creazione Ordine NON consegnato per Utente A
        self.order_pending = Order.objects.create(user=self.user_a, status='pending', total_amount=15.0)

    def test_ai_summary_access_denied_for_customer(self):
        """SCENARIO 1: Un cliente prova a fare l'analisi AI (Deve fallire 403)"""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get('/api/reviews/ai-summary/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_review_other_user_order_forbidden(self):
        """SCENARIO 2: Utente B prova a recensire l'ordine di Utente A (Deve fallire)"""
        self.client.force_authenticate(user=self.user_b)
        data = {'order': self.order_a.id, 'rating': 5, 'comment': 'Rubo la recensione!'}
        response = self.client.post('/api/reviews/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_review_non_delivered_order_forbidden(self):
        """SCENARIO 3: Recensione su ordine non ancora consegnato (Deve fallire)"""
        self.client.force_authenticate(user=self.user_a)
        data = {'order': self.order_pending.id, 'rating': 5, 'comment': 'Ancora non mi è arrivato nulla!'}
        response = self.client.post('/api/reviews/', data)
        # Qui il codice solleva PermissionDenied o ValidationError in base a come abbiamo settato il serializer
        self.assertIn(response.status_code, [403, 400]) 

    def test_admin_can_access_ai_summary(self):
        """SCENARIO 4: L'admin accede correttamente all'analisi (Deve riuscire 200)"""
        # Creiamo almeno una recensione per evitare il messaggio 'dati insufficienti'
        Review.objects.create(order=self.order_a, rating=5, comment="Ottimo!")
        
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/reviews/ai-summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)