import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import i18n from '@/i18n'
import { AlertTriangle, CircleHelp, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'

type TourStep = {
  title: string
  description: string
  warning?: string
  destination?:
    | 'patients'
    | 'queue'
    | 'medicines'
    | 'inventory-receipts'
    | 'inventory-stocktakes'
    | 'inventory-issues'
  target?: string
}

const overviewSteps: TourStep[] = [
  {
    get title() {
      return i18n.t('messages.welcomeToClinicviet')
    },
    get description() {
      return i18n.t('messages.thisShortTourIntroducesTheKeyAreasToHelpYouGe')
    },
  },
  {
    get title() {
      return i18n.t('messages.navigationMenu')
    },
    get description() {
      return i18n.t('messages.clinicWorkflowsAreGroupedHereCollapseTheMenuFor')
    },
    target: '[data-tour="sidebar"]',
  },
  {
    get title() {
      return i18n.t('messages.dailyExaminations')
    },
    get description() {
      return i18n.t('messages.admitPatientsMonitorTheQueueCallPatientsAndComp')
    },
    target: '[data-tour-url="/"]',
  },
  {
    get title() {
      return i18n.t('messages.patientRecords')
    },
    get description() {
      return i18n.t('messages.managePatientInformationAndLookUpMedicalHistory')
    },
    target: '[data-tour="create-patient"]',
  },
  {
    get title() {
      return i18n.t('messages.medicinesAndInventory')
    },
    get description() {
      return i18n.t('messages.useTheMedicineCatalogForPrescriptionsAndInventor')
    },
    target: '[data-tour-url="/medicines"]',
  },
  {
    get title() {
      return i18n.t('messages.yourAccount')
    },
    get description() {
      return i18n.t('messages.openThisMenuToViewYourProfileOrSignOut')
    },
    target: '[data-tour="user-menu"]',
  },
]

const patientWorkflowSteps: TourStep[] = [
  {
    get title() {
      return i18n.t('messages.1CreateAPatient')
    },
    get description() {
      return i18n.t('messages.openPatientsSelectAddPatientAndEnterBasicInform')
    },
    destination: 'patients',
    target: '[data-tour-url="/patients"]',
  },
  {
    get title() {
      return i18n.t('messages.2AdmitThePatient')
    },
    get description() {
      return i18n.t('messages.openDailyExaminationsSelectAdmitFindThePatientA')
    },
    destination: 'queue',
    target: '[data-tour="create-queue"]',
  },
  {
    get title() {
      return i18n.t('messages.3CreateAServiceRecord')
    },
    get description() {
      return i18n.t('messages.whenAPatientIsBeingExaminedCreateRecordAppears')
    },
    destination: 'queue',
    target: '[data-tour="create-prescription"]',
  },
  {
    get title() {
      return i18n.t('messages.4PrintAnInvoice')
    },
    get description() {
      return i18n.t('messages.afterAnExaminationIsCompletedAndHasAnInvoicePr')
    },
    destination: 'queue',
    target: '[data-tour="print-invoice"]',
  },
]

const inventoryWorkflowSteps: TourStep[] = [
  {
    get title() {
      return i18n.t('messages.1CreateAMedicineCatalog')
    },
    get description() {
      return i18n.t('messages.beforeCreatingAMedicineSearchByNameActiveIngred')
    },
    get warning() {
      return i18n.t('messages.importantEachMedicineProductShouldAppearOnlyOnce')
    },
    destination: 'medicines',
    target: '[data-tour="create-medicine"]',
  },
  {
    get title() {
      return i18n.t('messages.2ReceiveGoods')
    },
    get description() {
      return i18n.t('messages.openMedicineInventorySelectReceiptsAndCreateARe')
    },
    destination: 'inventory-receipts',
    target: '[data-tour="create-receipt"]',
  },
  {
    get title() {
      return i18n.t('messages.3TakeStock')
    },
    get description() {
      return i18n.t('messages.inMedicineInventoryOpenStocktakesToRecordPhysica')
    },
    destination: 'inventory-stocktakes',
    target: '[data-tour="create-stocktake"]',
  },
  {
    get title() {
      return i18n.t('messages.4IssueGoods')
    },
    get description() {
      return i18n.t('messages.openIssuesAndCreateAnIssueDocumentSelectTheCor')
    },
    destination: 'inventory-issues',
    target: '[data-tour="create-issue"]',
  },
]

type TourKind = 'overview' | 'patient-workflow' | 'inventory-workflow'

const tourSteps: Record<TourKind, TourStep[]> = {
  overview: overviewSteps,
  'patient-workflow': patientWorkflowSteps,
  'inventory-workflow': inventoryWorkflowSteps,
}

type Rect = Pick<DOMRect, 'top' | 'left' | 'width' | 'height' | 'bottom'>

export function ProductTour() {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const locationHref = useLocation({ select: (location) => location.href })
  const userId = useAuthStore((state) => state.auth.user?.id)
  const { isMobile, setOpen, setOpenMobile } = useSidebar()
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [tourKind, setTourKind] = useState<TourKind>('overview')
  const [rect, setRect] = useState<Rect | null>(null)
  const [checkedStorageKey, setCheckedStorageKey] = useState<string | null>(
    null
  )
  const [hasCompletedTour, setHasCompletedTour] = useState(false)
  const storageKey = userId ? `clinicviet-product-tour:${userId}` : null
  const steps = tourSteps[tourKind]
  const step = steps[stepIndex]

  const updateTarget = useCallback(() => {
    if (!step.target) {
      setRect(null)
      return
    }

    const element = Array.from(
      document.querySelectorAll<HTMLElement>(step.target)
    ).find((candidate) => {
      const candidateRect = candidate.getBoundingClientRect()
      return candidateRect.width > 0 && candidateRect.height > 0
    })
    if (!element) {
      setRect(null)
      return
    }

    element.scrollIntoView({ block: 'nearest' })
    const nextRect = element.getBoundingClientRect()
    setRect({
      top: nextRect.top,
      left: nextRect.left,
      width: nextRect.width,
      height: nextRect.height,
      bottom: nextRect.bottom,
    })
  }, [step.target])

  useEffect(() => {
    if (!storageKey) return
    const completed = localStorage.getItem(storageKey) === 'completed'
    const syncTimeout = window.setTimeout(() => {
      setHasCompletedTour(completed)
      setCheckedStorageKey(storageKey)
    }, 0)
    const timeout = completed
      ? undefined
      : window.setTimeout(() => setActive(true), 700)
    return () => {
      window.clearTimeout(syncTimeout)
      if (timeout !== undefined) window.clearTimeout(timeout)
    }
  }, [storageKey, userId])

  useEffect(() => {
    const startRequestedTour = (event: Event) => {
      const requestedTour = (event as CustomEvent<TourKind>).detail
      if (!tourSteps[requestedTour]) return
      setTourKind(requestedTour)
      setStepIndex(0)
      setActive(true)
    }

    window.addEventListener('clinicviet:start-tour', startRequestedTour)
    return () =>
      window.removeEventListener('clinicviet:start-tour', startRequestedTour)
  }, [])

  useEffect(() => {
    if (!active) return
    if (isMobile) setOpenMobile(true)
    else setOpen(true)
  }, [active, isMobile, setOpen, setOpenMobile])

  useEffect(() => {
    if (!active || !step.destination) return

    switch (step.destination) {
      case 'patients':
        void navigate({ to: '/patients', replace: true })
        break
      case 'queue':
        void navigate({ to: '/', replace: true })
        break
      case 'medicines':
        void navigate({ to: '/medicines', replace: true })
        break
      case 'inventory-receipts':
        void navigate({
          to: '/inventory',
          search: { tab: 'receipts' },
          replace: true,
        })
        break
      case 'inventory-stocktakes':
        void navigate({
          to: '/inventory',
          search: { tab: 'stocktakes' },
          replace: true,
        })
        break
      case 'inventory-issues':
        void navigate({
          to: '/inventory',
          search: { tab: 'issues' },
          replace: true,
        })
        break
    }
  }, [active, navigate, step.destination])

  useLayoutEffect(() => {
    if (!active) return
    const frame = window.requestAnimationFrame(updateTarget)
    const observer = new MutationObserver(updateTarget)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('resize', updateTarget)
    window.addEventListener('scroll', updateTarget, true)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', updateTarget)
      window.removeEventListener('scroll', updateTarget, true)
    }
  }, [active, locationHref, stepIndex, updateTarget])

  useEffect(() => {
    if (!active) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active])

  const finish = () => {
    if (storageKey) localStorage.setItem(storageKey, 'completed')
    setHasCompletedTour(true)
    setActive(false)
    if (isMobile) setOpenMobile(false)
  }

  const start = () => {
    setTourKind('overview')
    setStepIndex(0)
    setActive(true)
  }

  const tooltipStyle = rect
    ? {
        top: Math.max(16, Math.min(rect.bottom + 16, window.innerHeight - 300)),
        left: Math.min(
          Math.max(16, rect.left),
          Math.max(16, window.innerWidth - 376)
        ),
      }
    : undefined

  return (
    <>
      {storageKey === checkedStorageKey && !hasCompletedTour && (
        <Button
          type='button'
          size='icon'
          className='fixed end-5 bottom-5 z-40 size-11 rounded-full shadow-lg'
          onClick={start}
          aria-label={t('messages.openUserGuide')}
          title={t('messages.userGuide')}
        >
          <CircleHelp className='size-5' />
        </Button>
      )}

      {active &&
        createPortal(
          <div
            role='dialog'
            aria-modal='true'
            aria-label={t('messages.userGuide')}
          >
            {rect ? (
              <div
                className='pointer-events-none fixed z-[100] rounded-lg ring-2 ring-primary ring-offset-4 ring-offset-background transition-all duration-200'
                style={{
                  top: rect.top - 4,
                  left: rect.left - 4,
                  width: rect.width + 8,
                  height: rect.height + 8,
                  boxShadow: '0 0 0 9999px rgb(0 0 0 / 0.62)',
                }}
              />
            ) : (
              <div className='fixed inset-0 z-[100] bg-black/60' />
            )}

            <section
              className={
                rect
                  ? 'fixed z-[101] w-[calc(100vw-2rem)] max-w-[360px] rounded-xl border bg-card p-5 text-card-foreground shadow-2xl'
                  : 'fixed top-1/2 left-1/2 z-[101] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 text-card-foreground shadow-2xl'
              }
              style={tooltipStyle}
            >
              <button
                type='button'
                className='absolute end-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
                onClick={() => setActive(false)}
                aria-label={t('messages.closeGuide')}
              >
                <X className='size-4' />
              </button>
              <div className='mb-2 text-xs font-medium text-primary'>
                {t('messages.step')} {stepIndex + 1}/{steps.length}
              </div>
              <h2 className='pe-6 text-lg font-semibold'>{step.title}</h2>
              <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                {step.description}
              </p>
              {step.warning && (
                <div className='mt-4 flex gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm leading-5 text-amber-900 dark:text-amber-200'>
                  <AlertTriangle className='mt-0.5 size-4 shrink-0' />
                  <strong>{step.warning}</strong>
                </div>
              )}
              <div className='mt-5 flex items-center justify-between gap-3'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={finish}
                >
                  {t('messages.skip')}
                </Button>
                <div className='flex gap-2'>
                  {stepIndex > 0 && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setStepIndex((value) => value - 1)}
                    >
                      {t('messages.back')}
                    </Button>
                  )}
                  <Button
                    type='button'
                    size='sm'
                    onClick={() =>
                      stepIndex === steps.length - 1
                        ? finish()
                        : setStepIndex((value) => value + 1)
                    }
                  >
                    {stepIndex === steps.length - 1
                      ? t('messages.finish')
                      : t('messages.next')}
                  </Button>
                </div>
              </div>
            </section>
          </div>,
          document.body
        )}
    </>
  )
}
