import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { StatusBadge } from '../feedback/StatusBadge';
import { CardBase } from '../patterns/CardBase';
import { PaginationControl } from './PaginationControl';
import { UserAvatarBadge } from './UserAvatarBadge';

export type UserStatusVariant = 'success' | 'warning' | 'neutral' | 'info';

export interface UserData {
  initials: string;
  name: string;
  email: string;
  role: string;
  pcId: string;
  status: string;
  statusVariant: UserStatusVariant;
}

export interface UserTableCardProps {
  title?: string;
  users: UserData[];
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  style?: ViewStyle;
}

export function UserTableCard({
  title,
  users,
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  style,
}: UserTableCardProps) {
  return (
    <CardBase style={[styles.container, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.nameColumn]}>Name</Text>
        <Text style={[styles.headerCell, styles.emailColumn]}>Email</Text>
        <Text style={[styles.headerCell, styles.roleColumn]}>Role</Text>
        <Text style={[styles.headerCell, styles.pcIdColumn]}>PC ID</Text>
        <Text style={[styles.headerCell, styles.statusColumn]}>Status</Text>
      </View>

      {users.map((user, index) => (
        <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.rowAlternate]}>
          <View style={[styles.cell, styles.nameColumn]}>
            <UserAvatarBadge initials={user.initials} variant="default" />
            <View style={styles.nameInfo}>
              <Text style={styles.userName}>{user.name}</Text>
            </View>
          </View>
          <Text style={[styles.cell, styles.emailColumn, styles.emailText]}>{user.email}</Text>
          <View style={[styles.cell, styles.roleColumn]}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          </View>
          <Text style={[styles.cell, styles.pcIdColumn, styles.pcIdText]}>{user.pcId}</Text>
          <View style={[styles.cell, styles.statusColumn]}>
            <StatusBadge label={user.status} variant={user.statusVariant} />
          </View>
        </View>
      ))}

      {showPagination ? (
        <View style={styles.paginationContainer}>
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </View>
      ) : null}
    </CardBase>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    padding: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  rowAlternate: {
    backgroundColor: '#FAFAFA',
  },
  cell: {
    paddingRight: 12,
  },
  nameColumn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailColumn: {
    flex: 2,
  },
  roleColumn: {
    flex: 1,
  },
  pcIdColumn: {
    flex: 0.8,
  },
  statusColumn: {
    flex: 0.8,
  },
  nameInfo: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  emailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  roleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D4ED8',
  },
  pcIdText: {
    fontSize: 13,
    color: '#6B7280',
  },
  paginationContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
});
