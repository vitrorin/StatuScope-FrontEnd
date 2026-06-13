import React from 'react';
import { SeverityLevel } from '@/components/recommendations/SeverityBadge';

export type RecommendationTab = 'active' | 'high' | 'assigned' | 'unassigned' | 'archive';
export type RecommendationStatus =
  | 'new'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'assigned';

export interface RecommendationFeedItem {
  id: string;
  type: string;
  severity: SeverityLevel;
  backendSeverity: string;
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
  activeTask?: {
    id: string;
    ownerContactId?: string | null;
    ownerLabel?: string | null;
    departmentLabel?: string | null;
    deadlineAt?: string | null;
    notes?: string | null;
    priority?: string | null;
  };
  auditTrail: { timestamp: string; label: string }[];
}
