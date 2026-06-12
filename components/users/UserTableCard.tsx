import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { StatusBadge } from '../feedback/StatusBadge';
import { CardBase } from '../patterns/CardBase';
import { PaginationControl } from './PaginationControl';
import { UserAvatarBadge } from './UserAvatarBadge';
import { AppColors, AppRadii, AppSpacing, AppTypography } from '@/constants/theme';

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
    ...AppTypography.textStyles.cardTitle,
    color: AppColors.text.strong,
    padding: AppSpacing.card,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.muted,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: AppColors.surface.disabled,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.muted,
    paddingVertical: AppSpacing[6],
    paddingHorizontal: AppSpacing.card,
  },
  headerCell: {
    ...AppTypography.textStyles.captionStrong,
    fontSize: AppTypography.fontSizes.eyebrow,
    fontWeight: AppTypography.fontWeights.semibold,
    color: AppColors.table.muted,
    textTransform: 'uppercase',
    letterSpacing: AppTypography.letterSpacing.eyebrow,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: AppSpacing[6],
    paddingHorizontal: AppSpacing.card,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.surface.control,
    alignItems: 'center',
  },
  rowAlternate: {
    backgroundColor: AppColors.table.rowAlt,
  },
  cell: {
    paddingRight: AppSpacing[6],
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
    marginLeft: AppSpacing[5],
  },
  userName: {
    ...AppTypography.textStyles.body,
    fontWeight: AppTypography.fontWeights.medium,
    color: AppColors.text.strong,
  },
  emailText: {
    ...AppTypography.textStyles.bodySmall,
    color: AppColors.table.muted,
  },
  roleBadge: {
    backgroundColor: AppColors.surface.brandSoft,
    paddingHorizontal: AppSpacing.fieldGap,
    paddingVertical: AppSpacing[2],
    borderRadius: AppRadii.xl,
  },
  roleText: {
    ...AppTypography.textStyles.caption,
    fontWeight: AppTypography.fontWeights.medium,
    color: AppColors.brand.primary,
  },
  pcIdText: {
    ...AppTypography.textStyles.bodySmall,
    color: AppColors.table.muted,
  },
  paginationContainer: {
    padding: AppSpacing.card,
    borderTopWidth: 1,
    borderTopColor: AppColors.border.muted,
    alignItems: 'center',
  },
});
