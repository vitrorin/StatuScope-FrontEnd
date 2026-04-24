import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  style?: ViewStyle;
}

export function PaginationControl({
  currentPage,
  totalPages,
  onPageChange,
  style,
}: PaginationControlProps) {
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePagePress = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage && onPageChange) {
      onPageChange(page);
    }
  };

  const renderPage = (page: number | string, index: number) => {
    if (page === '...') {
      return (
        <Text key={`ellipsis-${index}`} style={styles.ellipsis}>
          ...
        </Text>
      );
    }

    const isActive = page === currentPage;
    return (
      <TouchableOpacity
        key={page}
        style={[styles.pageButton, isActive && styles.pageButtonActive]}
        onPress={() => handlePagePress(page)}
        disabled={isActive}
      >
        <Text style={[styles.pageText, isActive && styles.pageTextActive]}>
          {page}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Previous arrow */}
      <TouchableOpacity
        style={[styles.arrowButton, currentPage === 1 && styles.arrowDisabled]}
        onPress={() => handlePagePress(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Text style={[styles.arrowText, currentPage === 1 && styles.arrowTextDisabled]}>
          ‹
        </Text>
      </TouchableOpacity>

      {/* Page numbers */}
      <View style={styles.pagesContainer}>
        {getVisiblePages().map((page, index) => renderPage(page, index))}
      </View>

      {/* Next arrow */}
      <TouchableOpacity
        style={[styles.arrowButton, currentPage === totalPages && styles.arrowDisabled]}
        onPress={() => handlePagePress(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Text style={[styles.arrowText, currentPage === totalPages && styles.arrowTextDisabled]}>
          ›
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageButton: {
    minWidth: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  pageButtonActive: {
    backgroundColor: '#1D4ED8',
  },
  pageText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  pageTextActive: {
    color: '#FFFFFF',
  },
  ellipsis: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  arrowButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
  },
  arrowDisabled: {
    backgroundColor: '#F9FAFB',
  },
  arrowText: {
    fontSize: 20,
    color: '#4B5563',
    fontWeight: '600',
  },
  arrowTextDisabled: {
    color: '#D1D5DB',
  },
});