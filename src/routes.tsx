import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { AccessDenied } from '@/components/AccessDenied'
import { useAppStore } from '@/store/useAppStore'
import { canAccessScreen, type ScreenId } from '@/auth/permissions'

// Feature Pages
import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ImportsPage } from '@/features/imports/ImportsPage'
import { MasterDataPage } from '@/features/master-data/MasterDataPage'
import { InventoryDemandPage } from '@/features/inventory-demand/InventoryDemandPage'
import { MaterialRequirementsPage } from '@/features/materials/MaterialRequirementsPage'
import { PlanSetupPage } from '@/features/planning/PlanSetupPage'
import { PlanDetailPage } from '@/features/planning/PlanDetailPage'
import { ApprovalsPage } from '@/features/approvals/ApprovalsPage'
import { ScenariosPage } from '@/features/scenarios/ScenariosPage'
import { ExplainabilityPage } from '@/features/explainability/ExplainabilityPage'
import { CostBreakdownPage } from '@/features/cost/CostBreakdownPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { UsersRolesPage } from '@/features/admin/UsersRolesPage'
import { AuditTrailPage } from '@/features/audit/AuditTrailPage'
import { ChatPage } from '@/chat/ChatPage'

// Single Source of Truth Route Guard based strictly on permissions.ts
interface GuardProps {
  screenId: ScreenId
  children: React.ReactNode
}

export const RouteGuard: React.FC<GuardProps> = ({ screenId, children }) => {
  const { currentRole } = useAppStore()

  if (!canAccessScreen(currentRole, screenId)) {
    return <AccessDenied attemptedScreen={screenId} />
  }

  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <RouteGuard screenId="dashboard">
            <DashboardPage />
          </RouteGuard>
        ),
      },
      {
        path: 'imports',
        element: (
          <RouteGuard screenId="imports">
            <ImportsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'master-data',
        element: (
          <RouteGuard screenId="master_data">
            <MasterDataPage />
          </RouteGuard>
        ),
      },
      {
        path: 'inventory-demand',
        element: (
          <RouteGuard screenId="inventory_demand">
            <InventoryDemandPage />
          </RouteGuard>
        ),
      },
      {
        path: 'material-requirements',
        element: (
          <RouteGuard screenId="material_requirements">
            <MaterialRequirementsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'plan-setup',
        element: (
          <RouteGuard screenId="plan_setup">
            <PlanSetupPage />
          </RouteGuard>
        ),
      },
      {
        path: 'plan/:planId',
        element: (
          <RouteGuard screenId="plan_detail">
            <PlanDetailPage />
          </RouteGuard>
        ),
      },
      {
        path: 'approvals',
        element: (
          <RouteGuard screenId="approvals">
            <ApprovalsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'scenarios',
        element: (
          <RouteGuard screenId="scenarios">
            <ScenariosPage />
          </RouteGuard>
        ),
      },
      {
        path: 'explainability',
        element: (
          <RouteGuard screenId="explainability">
            <ExplainabilityPage />
          </RouteGuard>
        ),
      },
      {
        path: 'cost-breakdown',
        element: (
          <RouteGuard screenId="cost_breakdown">
            <CostBreakdownPage />
          </RouteGuard>
        ),
      },
      {
        path: 'reports',
        element: (
          <RouteGuard screenId="reports">
            <ReportsPage />
          </RouteGuard>
        ),
      },
      {
        path: 'users-roles',
        element: (
          <RouteGuard screenId="users_roles">
            <UsersRolesPage />
          </RouteGuard>
        ),
      },
      {
        path: 'audit-trail',
        element: (
          <RouteGuard screenId="audit_trail">
            <AuditTrailPage />
          </RouteGuard>
        ),
      },
      {
        path: 'chat',
        element: (
          <RouteGuard screenId="chat">
            <ChatPage />
          </RouteGuard>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
