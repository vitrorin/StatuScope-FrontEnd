import React from 'react';
import { SeverityLevel } from '@/components/recommendations/SeverityBadge';

export type RecommendationTab = 'active' | 'high' | 'inProgress' | 'archive';
export type RecommendationStatus =
  | 'new'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'assigned';

export interface RecommendationFeedItem {
  id: string;
  severity: SeverityLevel;
  category: string;
  title: string;
  description: string;
  createdByMode?: string;
  metaItems: { label: string; icon?: React.ReactNode }[];
  accentColor: string;
  actions: { label: string; variant: 'primary' | 'secondary' | 'ghost' }[];
  confidenceScore: number;
  expectedImpact: string;
  urgencyWindow: string;
  affectedDepartments: string[];
  affectedResources: string[];
  rationale: string[];
  recommendedActions: string[];
  status: RecommendationStatus;
  assignee?: string;
  auditTrail: { timestamp: string; label: string }[];
}
