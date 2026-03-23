from decimal import Decimal
from xxlimited_35 import Null

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Dish, Order, OrderItem, Review


class Command(BaseCommand):
    help = "Popola il database con gli ordini di test e le relative recensioni"

    @transaction.atomic
    def handle(self, *args, **options):
        User = get_user_model()

        fake_customers = [
            {
                "username": "mario.rossi",
                "email": "mario.rossi@kitchenmanager.local",
                "first_name": "Mario",
                "last_name": "Rossi",
            },
            {
                "username": "giulis.bianchi",
                "email": "giulia.bianchi@kitchenmanager.local",
                "first_name": "Giulia",
                "last_name": "Bianchi",
            },
            {
                "username": "luca.esposito",
                "email": "luca.esposito@kitchenmanager.local",
                "first_name": "Luca",
                "last_name": "Esposito",
            },
        ]

        customers = []
        for customer_data in fake_customers:
            user, _ = User.objects.update_or_create(
                username=customer_data["username"],
                defaults={
                    **customer_data,
                    "role": "customer",
                    "is_staff": False,
                    "is_superuser": False,
                },
            )
            user.set_password("customer123")
            user.save(update_fields=["password"])
            customers.append(user)

        margherita = Dish.objects.get(name="Margherita")
        diavola = Dish.objects.get(name="Diavola")
        bacon_burger = Dish.objects.get(name="Bacon Burger")
        coca_cola = Dish.objects.get(name="Coca Cola 33cl")

        review_text = "nella Coca cola c'era troppo ghiaccio."

        orders_data = [
            {
                "user": customers[0],
                "notes": "Coca cola senza limone",
                "items": [(bacon_burger, 1), (margherita, 1), (coca_cola, 2)],
                "review": f"Cibo molto buono e preparato con cura, ma {review_text}",
            },
            {
                "user": customers[1],
                "notes": None,
                "items": [(margherita, 1), (diavola, 1), (coca_cola, 2)],
                "review": f"Le pizze erano perfette e ben cotte. Purtroppo, {review_text}",
            },
            {
                "user": customers[2],
                "notes": "Margherita senza basilico",
                "items": [(diavola, 1), (margherita, 1), (coca_cola, 2)],
                "review": f"Nel complesso un pasto soddisfacente, però {review_text}",
            },
        ]

        for data in orders_data:
            order, _ = Order.objects.update_or_create(
                user=data["user"],
                defaults={
                    "notes": data["notes"],
                    "status": "delivered",
                    "total_amount": Decimal("0.00"),
                },
            )

            order.items.all().delete()

            total_amount = Decimal("0.00")

            for dish, qty in data["items"]:
                OrderItem.objects.create(
                    order=order,
                    dish=dish,
                    quantity=qty,
                    unit_price=dish.price,
                )
                total_amount += dish.price * qty

            order.total_amount = total_amount
            order.save(update_fields=["total_amount"])

            Review.objects.update_or_create(
                order=order,
                defaults={
                    "rating": 4,
                    "comment": data["review"],
                },
            )

        self.stdout.write(self.style.SUCCESS("Seed degli ordini completato con successo!"))
