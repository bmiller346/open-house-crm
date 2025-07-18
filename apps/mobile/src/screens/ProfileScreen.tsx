import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Avatar, List, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = () => {
  const userProfile = {
    name: 'John Doe',
    email: 'john.doe@realestate.com',
    phone: '(555) 123-4567',
    role: 'Real Estate Investor',
    company: 'Wholesale Properties LLC',
    joinDate: 'January 2023',
    totalDeals: 23,
    totalRevenue: 345000,
    avgDealSize: 15000
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text 
              size={80} 
              label="JD"
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile.name}</Text>
              <Text style={styles.profileRole}>{userProfile.role}</Text>
              <Text style={styles.profileCompany}>{userProfile.company}</Text>
              <Text style={styles.profileJoinDate}>Member since {userProfile.joinDate}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statNumber}>{userProfile.totalDeals}</Text>
              <Text style={styles.statLabel}>Total Deals</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statNumber}>${userProfile.totalRevenue.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statNumber}>${userProfile.avgDealSize.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Avg Deal Size</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Settings Menu */}
        <Card style={styles.menuCard}>
          <Card.Title title="Account Settings" />
          <Card.Content>
            <List.Section>
              <List.Item
                title="Edit Profile"
                description="Update your personal information"
                left={props => <List.Icon {...props} icon="account-edit" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {}}
              />
              <Divider />
              <List.Item
                title="Notifications"
                description="Manage your notification preferences"
                left={props => <List.Icon {...props} icon="bell" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {}}
              />
              <Divider />
              <List.Item
                title="Privacy & Security"
                description="Password and security settings"
                left={props => <List.Icon {...props} icon="security" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {}}
              />
              <Divider />
              <List.Item
                title="Subscription"
                description="Manage your subscription plan"
                left={props => <List.Icon {...props} icon="credit-card" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {}}
              />
            </List.Section>
          </Card.Content>
        </Card>

        {/* App Settings */}
        <Card style={styles.menuCard}>
          <Card.Title title="App Settings" />
          <Card.Content>
            <List.Section>
              <List.Item
                title="Data & Sync"
                description="Backup and synchronization"
                left={props => <List.Icon {...props} icon="cloud-sync" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {}}
              />
              <Divider />
              <List.Item
                title="Export Data"
                description="Download your data"
                left={props => <List.Icon {...props} icon="download" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {}}
              />
              <Divider />
              <List.Item
                title="Help & Support"
                description="Get help and contact support"
                left={props => <List.Icon {...props} icon="help-circle" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {}}
              />
              <Divider />
              <List.Item
                title="About"
                description="App version and information"
                left={props => <List.Icon {...props} icon="information" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {}}
              />
            </List.Section>
          </Card.Content>
        </Card>

        {/* Sign Out Button */}
        <Card style={styles.signOutCard}>
          <Card.Content>
            <Button 
              mode="outlined" 
              onPress={() => {}}
              style={styles.signOutButton}
              textColor="#F44336"
            >
              Sign Out
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
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
  profileCard: {
    marginBottom: 20,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#007AFF',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileRole: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  profileCompany: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  profileJoinDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '32%',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  menuCard: {
    marginBottom: 16,
  },
  signOutCard: {
    marginBottom: 20,
  },
  signOutButton: {
    borderColor: '#F44336',
  },
});

export default ProfileScreen;
