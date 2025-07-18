import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card, FAB, Chip, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Appointment {
  id: string;
  title: string;
  type: 'property-viewing' | 'client-meeting' | 'inspection' | 'closing' | 'phone-call';
  date: string;
  time: string;
  duration: number; // minutes
  location?: string;
  isVirtual: boolean;
  attendees: string[];
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Property Walkthrough - 123 Main St',
    type: 'property-viewing',
    date: '2024-01-25',
    time: '10:00',
    duration: 60,
    location: '123 Main St, Springfield IL',
    isVirtual: false,
    attendees: ['John Smith', 'Sarah Johnson'],
    status: 'confirmed'
  },
  {
    id: '2',
    title: 'Investor Meeting - Q1 Strategy',
    type: 'client-meeting',
    date: '2024-01-25',
    time: '14:30',
    duration: 90,
    isVirtual: true,
    attendees: ['Mike Wilson', 'Lisa Chen'],
    status: 'scheduled'
  },
  {
    id: '3',
    title: 'Property Inspection - 456 Oak Ave',
    type: 'inspection',
    date: '2024-01-26',
    time: '09:00',
    duration: 120,
    location: '456 Oak Ave, Chicago IL',
    isVirtual: false,
    attendees: ['David Brown', 'Inspector Joe'],
    status: 'confirmed'
  }
];

const CalendarScreen = () => {
  const getTypeColor = (type: Appointment['type']) => {
    switch (type) {
      case 'property-viewing': return '#4CAF50';
      case 'client-meeting': return '#2196F3';
      case 'inspection': return '#FF9800';
      case 'closing': return '#9C27B0';
      case 'phone-call': return '#607D8B';
      default: return '#666';
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'scheduled': return '#FF9800';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getTypeIcon = (type: Appointment['type']) => {
    switch (type) {
      case 'property-viewing': return '🏠';
      case 'client-meeting': return '👥';
      case 'inspection': return '🔍';
      case 'closing': return '📋';
      case 'phone-call': return '📞';
      default: return '📅';
    }
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <Card style={styles.appointmentCard}>
      <Card.Content>
        <View style={styles.appointmentHeader}>
          <Text style={styles.appointmentIcon}>{getTypeIcon(item.type)}</Text>
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentTitle}>{item.title}</Text>
            <View style={styles.appointmentMeta}>
              <Text style={styles.appointmentTime}>
                {new Date(item.date).toLocaleDateString()} at {item.time}
              </Text>
              <Text style={styles.appointmentDuration}>
                ({item.duration} min)
              </Text>
            </View>
            {item.location && (
              <Text style={styles.appointmentLocation}>📍 {item.location}</Text>
            )}
            {item.isVirtual && (
              <Text style={styles.virtualMeeting}>💻 Virtual Meeting</Text>
            )}
          </View>
          <View style={styles.appointmentBadges}>
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
        
        <View style={styles.attendeesContainer}>
          <Text style={styles.attendeesLabel}>Attendees:</Text>
          <Text style={styles.attendeesList}>{item.attendees.join(', ')}</Text>
        </View>

        <View style={styles.actionButtons}>
          <Button mode="outlined" style={styles.actionButton}>
            Reschedule
          </Button>
          <Button mode="contained" style={styles.actionButton}>
            Join/View
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const todayAppointments = mockAppointments.filter(apt => 
    new Date(apt.date).toDateString() === new Date().toDateString()
  );
  
  const upcomingAppointments = mockAppointments.filter(apt => 
    new Date(apt.date) > new Date()
  );

  const totalHours = mockAppointments.reduce((sum, apt) => sum + apt.duration, 0) / 60;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar 📅</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{todayAppointments.length}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#2196F3' }]}>
            {upcomingAppointments.length}
          </Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalHours.toFixed(1)}h</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
            {mockAppointments.filter(a => a.type === 'property-viewing').length}
          </Text>
          <Text style={styles.statLabel}>Viewings</Text>
        </View>
      </View>

      <FlatList
        data={mockAppointments}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item.id}
        style={styles.appointmentsList}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Handle schedule appointment */}}
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
  appointmentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  appointmentCard: {
    marginBottom: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appointmentIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 4,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#666',
  },
  appointmentDuration: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  appointmentLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  virtualMeeting: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 4,
  },
  appointmentBadges: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 4,
  },
  typeChip: {
    marginBottom: 4,
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  attendeesLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    marginRight: 8,
  },
  attendeesList: {
    fontSize: 12,
    color: '#666',
    flex: 1,
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

export default CalendarScreen;
