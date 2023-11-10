import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ordinal } from "../utils/Helpers";
import { YearData, fetchFiscalYearData } from "../utils/FirebaseHelpers";

export type FiscalMonthEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  weekNumber: number;
};

const localizer = momentLocalizer(moment);

export const FiscalCalendar: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<FiscalMonthEvent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const createEventsFromYear = (yearData: YearData): FiscalMonthEvent[] => {
        const newEvents: FiscalMonthEvent[] = [];
        yearData.weekEvents?.forEach((week) => {
          newEvents.push({
            title: week.title || `${ordinal(week.weekNumber)} Week`,
            start: new Date(
              new Date(week.start).setDate(new Date(week.start).getDate() + 1)
            ),
            end: new Date(
              new Date(week.end).setDate(new Date(week.end).getDate() + 1)
            ),
            allDay: week.allDay,
            weekNumber: week.weekNumber,
          });
        });
        return newEvents;
      };

      const yearsToFetch = [
        date.getFullYear(),
        date.getFullYear() + 1,
        date.getFullYear() - 1,
      ];

      let allEvents: FiscalMonthEvent[] = [];

      for (const year of yearsToFetch) {
        const fetchedYear: YearData | null = await fetchFiscalYearData(
          `${year}`
        );
        if (!fetchedYear) continue;
        console.log(fetchedYear);
        const newEvents = createEventsFromYear(fetchedYear);
        allEvents = [...allEvents, ...newEvents];
        console.log(newEvents);
      }

      setEvents(allEvents);
      console.log(allEvents);
    };

    fetchData();
  }, [date]);

  return (
    <div style={{ height: 600 }}>
      <BigCalendar
        localizer={localizer}
        startAccessor="start"
        endAccessor="end"
        views={["month"]}
        defaultView="month"
        defaultDate={new Date()}
        selectable={true}
        eventPropGetter={eventStyleGetter}
        components={{
          event: ({
            event,
            title,
          }: {
            event: FiscalMonthEvent;
            title: string;
          }) => {
            if (event.start.getDay() === 0) {
              return (
                <div
                  style={{
                    textAlign: "center",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {title}
                </div>
              );
            }
            return null;
          },
        }}
        onNavigate={(newDate: Date) => {
          if (newDate.getFullYear() !== date.getFullYear()) {
            setDate(newDate);
          }
        }}
        events={events}
      />
    </div>
  );
};

const eventStyleGetter = (event: FiscalMonthEvent) => {
  let backgroundColor = "#f0f0f0";
  if (event.weekNumber === 1) {
    backgroundColor = "#d9ead3";
  } else if (event.weekNumber === 2) {
    backgroundColor = "#fff2cc";
  } else if (event.weekNumber === 3) {
    backgroundColor = "#fce5cd";
  } else if (event.weekNumber === 4) {
    backgroundColor = "#f4cccc";
  }

  let style = {
    backgroundColor: backgroundColor,
    borderRadius: "0px",
    opacity: 0.8,
    color: "black",
    border: "0px",
    display: "block",
    margin: "0px",
    height: "100%",
    width: "100%",
  };

  return {
    style: style,
  };
};
