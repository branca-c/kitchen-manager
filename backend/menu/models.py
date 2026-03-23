import uuid
from django.db import models
from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver
from rest_framework.exceptions import ValidationError

class Category(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text='Examples: "Main Course", "Side Dish", "Drinks", "Desserts"'
    )

    class Meta:
        db_table = "categories"
    
    def __str__(self):
        return self.name

class Dish(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    name = models.CharField(
        max_length=200
    )
    description = models.TextField(
        blank=True, 
        null=True
    )
    price = models.DecimalField(
        max_digits=6, 
        decimal_places=2
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="dishes"
    )
    ingredients = models.TextField(
        help_text="Comma-separated list of ingredients"
    )
    has_allergens = models.BooleanField(
        default=False, 
        help_text="Select if the dish contains allergens"
    )
    is_active = models.BooleanField(
        default=True, 
        help_text="Indicates if the dish is present in the current menu"
    )
    is_available = models.BooleanField(
        default=True, 
        help_text="If disabled, the dish will appear as 'sold out' and won't be orderable"
    )

    class Meta:
        db_table = "dishes"

    def __str__(self):
        return self.name


# ==========================================
# OBSERVER PATTERN (FOR HISTORY)
# ==========================================
# The history observer monitors changes to the state of dishes and
# ensures that dishes removed from the menu are not deleted
# from the database, preserving the existing order history.

class BaseObserver:
    """
    Base class for handling model observation logic.
    """
    def update(self, instance, **kwargs):
        raise NotImplementedError("Subclasses must implement the update method.")

class DishObserver(BaseObserver):
    """
    Observer to apply business logic defined for the Menu:
    1. is_active=True AND is_available=True -> Visible and orderable.
    2. is_active=True AND is_available=False -> Visible but 'Sold Out'.
    3. is_active=False AND is_available=False -> Removed from menu, kept in database.
    """
    def update(self, instance, **kwargs):
        # If the dish is removed from the menu (is_active=False),
        # it must become non-orderable (is_available=False).
        if not instance.is_active and instance.is_available:
            instance.is_available = False

# Global instance of the observer
dish_observer = DishObserver()

@receiver(pre_save, sender=Dish)
def dish_pre_save_handler(sender, instance, **kwargs):
    """
    Intercepts saving to validate state consistency.
    """
    dish_observer.update(instance)

@receiver(pre_delete, sender=Dish)
def prevent_dish_deletion(sender, instance, **kwargs):
    """
    Blocks deletion from the database to preserve history.
    """
    raise ValidationError(
        "Dishes cannot be permanently deleted to avoid breaking order history. "
        "Please use the 'is_active' field to remove it from the menu."
    )