import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card, FAB, Chip, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  propertyType: 'single-family' | 'multi-family' | 'commercial' | 'land';
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  listPrice: number;
  arvValue: number;
  status: 'available' | 'under-contract' | 'sold' | 'off-market';
  dateAdded: string;
}

const mockProperties: Property[] = [
  {
    id: '1',
    address: '123 Wholesale Way',
    city: 'Springfield',
    state: 'IL',
    propertyType: 'single-family',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    listPrice: 85000,
    arvValue: 150000,
    status: 'available',
    dateAdded: '2024-01-10'
  },
  {
    id: '2',
    address: '456 Investment Blvd',
    city: 'Chicago',
    state: 'IL',
    propertyType: 'multi-family',
    bedrooms: 8,
    bathrooms: 4,
    sqft: 3200,
    listPrice: 320000,
    arvValue: 480000,
    status: 'under-contract',
    dateAdded: '2024-01-05'
  }
];

const PropertiesScreen = () => {
  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'under-contract': return '#FF9800';
      case 'sold': return '#2196F3';
      case 'off-market': return '#F44336';
      default: return '#666';
    }
  };

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <Card style={styles.propertyCard}>
      <Card.Content>
        <View style={styles.propertyHeader}>
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyAddress}>{item.address}</Text>
            <Text style={styles.propertyLocation}>{item.city}, {item.state}</Text>
            <Text style={styles.propertyDetails}>
              {item.propertyType} • {item.bedrooms}br/{item.bathrooms}ba • {item.sqft?.toLocaleString()} sqft
            </Text>
          </View>
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
            textStyle={{ color: getStatusColor(item.status) }}
          >
            {item.status}
          </Chip>
        </View>
        
        <View style={styles.priceContainer}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>List Price</Text>
            <Text style={styles.priceValue}>${item.listPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>ARV</Text>
            <Text style={styles.priceValue}>${item.arvValue.toLocaleString()}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Potential Profit</Text>
            <Text style={[styles.priceValue, styles.profitValue]}>
              ${(item.arvValue - item.listPrice).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button mode="outlined" style={styles.actionButton}>
            View Details
          </Button>
          <Button mode="contained" style={styles.actionButton}>
            Contact Owner
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const totalProperties = mockProperties.length;
  const availableProperties = mockProperties.filter(p => p.status === 'available').length;
  const totalValue = mockProperties.reduce((sum, p) => sum + p.listPrice, 0);
  const potentialProfit = mockProperties.reduce((sum, p) => sum + (p.arvValue - p.listPrice), 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Properties 🏠</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalProperties}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
            {availableProperties}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>${(totalValue / 1000).toFixed(0)}K</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
            ${(potentialProfit / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.statLabel}>Profit</Text>
        </View>
      </View>

      <FlatList
        data={mockProperties}
        renderItem={renderPropertyItem}
        keyExtractor={(item) => item.id}
        style={styles.propertiesList}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Handle add property */}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  propertiesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  propertyCard: {
    marginBottom: 16,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyAddress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  propertyDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusChip: {
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  profitValue: {
    color: '#4CAF50',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
  },
});

export default PropertiesScreen;
