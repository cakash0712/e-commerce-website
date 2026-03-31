import React, { createContext, useContext, useState, useEffect } from 'react';

const FoodCartContext = createContext();

export const useFoodCart = () => useContext(FoodCartContext);

export const FoodCartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('foodCart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [location, setLocation] = useState(() => {
        return localStorage.getItem('userLocation') || 'Select Location';
    });

    const [wishlist, setWishlist] = useState(() => {
        const savedWishlist = localStorage.getItem('foodWishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    });

    useEffect(() => {
        localStorage.setItem('foodCart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('foodWishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToCart = (item, restaurantId, restaurantName) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1, restaurantId, restaurantName }];
        });
    };

    const toggleWishlist = (restaurantId) => {
        setWishlist(prev => {
            if (prev.includes(restaurantId)) {
                return prev.filter(id => id !== restaurantId);
            }
            return [...prev, restaurantId];
        });
    };

    const isWishlisted = (restaurantId) => wishlist.includes(restaurantId);

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return newQty === 0 ? null : { ...item, quantity: newQty };
            }
            return item;
        }).filter(Boolean));
    };

    const clearCart = () => setCart([]);

    const getItemCount = () => cart.reduce((total, item) => total + item.quantity, 0);

    const getCartTotal = () => cart.reduce((total, item) => total + ((item.price || item.base_price || 0) * item.quantity), 0);

    const handleLocationUpdate = async (newLoc) => {
        setLocation(newLoc);
        localStorage.setItem('userLocation', newLoc);
    };

    return (
        <FoodCartContext.Provider value={{
            cartItems: cart,
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getItemCount,
            getTotal: getCartTotal,
            getCartTotal,
            location,
            handleLocationUpdate,
            wishlist,
            toggleWishlist,
            isWishlisted
        }}>
            {children}
        </FoodCartContext.Provider>
    );
};
