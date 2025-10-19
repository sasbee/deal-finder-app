import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';

const API_URL = 'http://localhost:5000/api'; // Change to your backend URL

export default function App() {
  const [requirement, setRequirement] = useState('');
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchDeals = async () => {
    if (!requirement.trim()) {
      Alert.alert('Error', 'Please enter what you\'re looking for');
      return;
    }

    setLoading(true);
    setSearched(true);
    
    try {
      const response = await fetch(`${API_URL}/search-deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requirement: requirement.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setDeals(data.deals);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch deals');
        setDeals([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server. Make sure the backend is running.');
      console.error(error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const openUrl = (url) => {
    Linking.openURL(url).catch((err) =>
      Alert.alert('Error', 'Failed to open link')
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    
    return stars.join('') + ` ${rating}`;
  };

  const calculateDiscount = (original, current) => {
    if (!original || original <= current) return null;
    const discount = Math.round(((original - current) / original) * 100);
    return discount;
  };

  const DealCard = ({ deal, index }) => {
    const discount = calculateDiscount(deal.originalPrice, deal.price);
    
    return (
      <View style={styles.dealCard}>
        <View style={styles.dealHeader}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>
          <View style={styles.availabilityBadge}>
            <Text style={styles.availabilityText}>{deal.availability}</Text>
          </View>
        </View>

        <Text style={styles.dealTitle}>{deal.title}</Text>
        <Text style={styles.retailer}>{deal.retailer}</Text>

        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {deal.currency} ${deal.price.toFixed(2)}
            </Text>
            {discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discount}% OFF</Text>
              </View>
            )}
          </View>
          {deal.originalPrice && deal.originalPrice > deal.price && (
            <Text style={styles.originalPrice}>
              Was: ${deal.originalPrice.toFixed(2)}
            </Text>
          )}
        </View>

        <Text style={styles.description}>{deal.description}</Text>

        {deal.rating && (
          <Text style={styles.rating}>{renderStars(deal.rating)}</Text>
        )}

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => openUrl(deal.url)}
        >
          <Text style={styles.viewButtonText}>View Deal →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 Deal Finder</Text>
        <Text style={styles.headerSubtitle}>Find the best deals online</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="What are you looking for?"
          placeholderTextColor="#999"
          value={requirement}
          onChangeText={setRequirement}
          onSubmitEditing={searchDeals}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={searchDeals}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Searching for best deals...</Text>
          </View>
        )}

        {!loading && searched && deals.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No deals found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        )}

        {!loading && deals.length > 0 && (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                Top {deals.length} Deals for "{requirement}"
              </Text>
              <Text style={styles.resultsSubtitle}>
                Sorted by relevance and price
              </Text>
            </View>

            {deals.map((deal, index) => (
              <DealCard key={index} deal={deal} index={index} />
            ))}
          </>
        )}

        {!searched && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeIcon}>🎯</Text>
            <Text style={styles.welcomeTitle}>Find Your Perfect Deal</Text>
            <Text style={styles.welcomeText}>
              Enter what you're looking for and we'll find the best deals from across the web
            </Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>✓ Best prices guaranteed</Text>
              <Text style={styles.featureItem}>✓ Real-time availability</Text>
              <Text style={styles.featureItem}>✓ Top-rated products</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  searchButton: {
    marginLeft: 12,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  dealCard: {
    backgroundColor: '#fff',
    margin: 12,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rankBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  availabilityBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  retailer: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 12,
    fontWeight: '600',
  },
  priceContainer: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  rating: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  viewButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  welcomeContainer: {
    padding: 40,
    alignItems: 'center',
  },
  welcomeIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  featureList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
    textAlign: 'center',
  },
});