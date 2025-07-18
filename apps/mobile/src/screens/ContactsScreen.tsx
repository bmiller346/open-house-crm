import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card, Searchbar, FAB, Chip, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'lead' | 'client' | 'investor' | 'agent';
  status: 'hot' | 'warm' | 'cold';
  lastContact: string;
  avatar?: string;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    type: 'lead',
    status: 'hot',
    lastContact: '2 days ago'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 987-6543',
    type: 'investor',
    status: 'warm',
    lastContact: '1 week ago'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.wilson@email.com',
    phone: '(555) 456-7890',
    type: 'client',
    status: 'hot',
    lastContact: 'Yesterday'
  }
];

const ContactsScreen = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'hot': return '#FF4444';
      case 'warm': return '#FF8800';
      case 'cold': return '#4444FF';
      default: return '#666';
    }
  };

  const getTypeColor = (type: Contact['type']) => {
    switch (type) {
      case 'lead': return '#4CAF50';
      case 'client': return '#2196F3';
      case 'investor': return '#FF9800';
      case 'agent': return '#9C27B0';
      default: return '#666';
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <Card style={styles.contactCard}>
      <Card.Content>
        <View style={styles.contactHeader}>
          <Avatar.Text 
            size={40} 
            label={item.name.split(' ').map(n => n[0]).join('')}
            style={{ backgroundColor: getTypeColor(item.type) }}
          />
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactEmail}>{item.email}</Text>
            <Text style={styles.contactPhone}>{item.phone}</Text>
          </View>
          <View style={styles.contactBadges}>
            <Chip 
              mode="outlined" 
              style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
              textStyle={{ color: getStatusColor(item.status) }}
            >
              {item.status}
            </Chip>
            <Chip 
              mode="outlined" 
              style={[styles.typeChip, { borderColor: getTypeColor(item.type) }]}
              textStyle={{ color: getTypeColor(item.type) }}
            >
              {item.type}
            </Chip>
          </View>
        </View>
        <Text style={styles.lastContact}>Last contact: {item.lastContact}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contacts 👥</Text>
        <Searchbar
          placeholder="Search contacts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{mockContacts.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FF4444' }]}>
            {mockContacts.filter(c => c.status === 'hot').length}
          </Text>
          <Text style={styles.statLabel}>Hot Leads</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
            {mockContacts.filter(c => c.type === 'lead').length}
          </Text>
          <Text style={styles.statLabel}>Leads</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#2196F3' }]}>
            {mockContacts.filter(c => c.type === 'client').length}
          </Text>
          <Text style={styles.statLabel}>Clients</Text>
        </View>
      </View>

      <FlatList
        data={mockContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        style={styles.contactsList}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Handle add contact */}}
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
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
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
  contactsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contactCard: {
    marginBottom: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contactEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contactBadges: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 4,
  },
  typeChip: {
    marginBottom: 4,
  },
  lastContact: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
  },
});

export default ContactsScreen;
