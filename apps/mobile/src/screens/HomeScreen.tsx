import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  const stats = {
    totalLeads: 89,
    activeDeals: 12,
    monthlyRevenue: 45000,
    propertiesViewed: 23
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Good Morning! 👋</Text>
          <Text style={styles.subtitle}>Here's your business overview</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statNumber}>{stats.totalLeads}</Text>
              <Text style={styles.statLabel}>Total Leads</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statNumber}>{stats.activeDeals}</Text>
              <Text style={styles.statLabel}>Active Deals</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statNumber}>${stats.monthlyRevenue.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Monthly Revenue</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statNumber}>{stats.propertiesViewed}</Text>
              <Text style={styles.statLabel}>Properties Viewed</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <Card style={styles.quickActionsCard}>
          <Card.Title title="Quick Actions" />
          <Card.Content>
            <View style={styles.quickActionsContainer}>
              <Button mode="outlined" style={styles.quickActionButton}>
                Add Contact
              </Button>
              <Button mode="outlined" style={styles.quickActionButton}>
                New Property
              </Button>
              <Button mode="outlined" style={styles.quickActionButton}>
                Schedule Call
              </Button>
              <Button mode="outlined" style={styles.quickActionButton}>
                View Calendar
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <Card.Title title="Recent Activity" />
          <Card.Content>
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>📞 Called John Smith about 123 Main St</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>🏠 Added new property: 456 Oak Ave</Text>
              <Text style={styles.activityTime}>4 hours ago</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityText}>📧 Sent follow-up email to 5 contacts</Text>
              <Text style={styles.activityTime}>Yesterday</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Handle quick add */}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quickActionsCard: {
    marginBottom: 20,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    marginBottom: 8,
  },
  activityCard: {
    marginBottom: 20,
  },
  activityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityText: {
    fontSize: 14,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
  },
});

export default HomeScreen;
