import React from 'react';
import { SeverityLevel } from '@/components/recommendations/SeverityBadge';

export type RecommendationTab = 'active' | 'high' | 'inProgress' | 'archive';
export type RecommendationImageMode = 'heatmap' | 'chart' | 'supply';
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
  metaItems: { label: string; icon?: React.ReactNode }[];
  imageMode: RecommendationImageMode;
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
