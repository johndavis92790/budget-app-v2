import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { WeekData, fetchFiscalWeekEvents } from "../utils/FirebaseHelpers";

const localizer = momentLocalizer(moment);

export const FiscalCalendar: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<WeekData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const createWeeklyEvents = (weekEvents: WeekData[]): WeekData[] => {
        const newEvents: WeekData[] = [];
        weekEvents.forEach((week) => {
          newEvents.push({
            ...week,
            startDate: new Date(
              new Date(week.start).setDate(new Date(week.start).getDate() + 1),
            ),
            endDate: new Date(
              new Date(week.end).setDate(new Date(week.end).getDate() + 1),
            ),
          });
        });
        return newEvents;
      };

      const yearsToFetch = [
        `${date.getFullYear()}`,
        `${date.getFullYear() + 1}`,
        `${date.getFullYear() - 1}`,
      ];

      const fetchedYearWeeks: WeekData[] | null =
        await fetchFiscalWeekEvents(yearsToFetch);
      if (!fetchedYearWeeks) return;
      const newEvents = createWeeklyEvents(fetchedYearWeeks);

      setEvents(newEvents);
      console.log(newEvents);
    };

    fetchData();
  }, [date]);

  return (
    <div style={{ height: 600 }}>
      <BigCalendar
        localizer={localizer}
        startAccessor="startDate"
        endAccessor="endDate"
        views={["month"]}
        defaultView="month"
        defaultDate={new Date()}
        selectable={true}
        eventPropGetter={eventStyleGetter}
        components={{
          event: ({ event, title }: { event: WeekData; title: string }) => {
            if (event.startDate?.getDay() === 0) {
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

const eventStyleGetter = (event: WeekData) => {
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
