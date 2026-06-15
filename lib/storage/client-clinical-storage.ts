import {
  MOCK_CLIENT_MEASUREMENTS,
  MOCK_CLIENT_REGISTERED_AT,
  type ClientMotivationData,
  type MeasurementSnapshot,
} from "@/lib/mock/client-data";
import {
  formatTurkishLongDate,
  getDaysUntilDate,
} from "@/lib/utils/clinical-dates";

export type SelectedDietitian = {
  id: string;
  name: string;
};

export type ClientClinicalState = MeasurementSnapshot & {
  nextAppointmentDate: string | null;
  selectedDietitian: SelectedDietitian | null;
  programStartedAt: string;
};

const DEFAULT_APPOINTMENT_DATE = "2026-06-15";

const DEFAULT_DIETITIAN: SelectedDietitian = {
  id: "dt-1",
  name: "Dr. Ayşe Yılmaz",
};

export function getDefaultClientClinicalState(): ClientClinicalState {
  return {
    start: MOCK_CLIENT_MEASUREMENTS.start,
    previous: MOCK_CLIENT_MEASUREMENTS.previous,
    current: MOCK_CLIENT_MEASUREMENTS.current,
    targetWeight: MOCK_CLIENT_MEASUREMENTS.targetWeight,
    targetFatPercentage: MOCK_CLIENT_MEASUREMENTS.targetFatPercentage,
    nextAppointmentDate: DEFAULT_APPOINTMENT_DATE,
    selectedDietitian: DEFAULT_DIETITIAN,
    programStartedAt: MOCK_CLIENT_REGISTERED_AT,
  };
}

export function buildClientMotivationData(
  state: ClientClinicalState,
): ClientMotivationData {
  return {
    ...state,
    daysUntilCheckup: state.nextAppointmentDate
      ? getDaysUntilDate(state.nextAppointmentDate)
      : null,
    nextAppointmentDate: state.nextAppointmentDate
      ? formatTurkishLongDate(state.nextAppointmentDate)
      : null,
  };
}

export function loadClientMotivationData(): ClientMotivationData {
  return buildClientMotivationData(getDefaultClientClinicalState());
}
