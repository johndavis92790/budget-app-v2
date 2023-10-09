import React, { useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

type FiscalMonthEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  weekNumber?: number;
};

const localizer = momentLocalizer(moment);

export const FiscalCalendar: React.FC = () => {
  const [date, setDate] = useState(new Date()); // To store the currently visible date

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
          event: ({ event }: { event: FiscalMonthEvent }) => {
            if (event.start.getDay() === 0) {
              return <span>{event.title}</span>;
            }
            return <span></span>;
          },
        }}
        date={date}
        onNavigate={(newDate: string | number | Date) =>
          setDate(new Date(newDate))
        }
        events={getUniqueEvents(getFiscalMonthEvents(date))}
      />
    </div>
  );
};

const getFiscalMonthEvents = (visibleDate: Date) => {
  const events = [];

  // Generate dates for a wider range: one year back and one year forward
  const startDate = new Date(
    visibleDate.getFullYear() - 1,
    visibleDate.getMonth(),
    1
  );
  const endDate = new Date(
    visibleDate.getFullYear() + 1,
    visibleDate.getMonth() + 1,
    0
  );

  let currentMonthStart = new Date(startDate);

  while (currentMonthStart <= endDate) {
    let fiscalStartDate = getFiscalStartDate(currentMonthStart);
    let fiscalDate = new Date(fiscalStartDate);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 7; j++) {
        events.push({
          title: `${ordinal(i + 1)} Week`,
          start: new Date(fiscalDate),
          end: new Date(fiscalDate),
          allDay: true,
          weekNumber: i + 1,
        });
        fiscalDate.setDate(fiscalDate.getDate() + 1);
      }
    }

    // Move to the next month
    currentMonthStart = new Date(
      currentMonthStart.getFullYear(),
      currentMonthStart.getMonth() + 1,
      1
    );
  }

  return events;
};

const getUniqueEvents = (events: FiscalMonthEvent[]) => {
  const seenDates: Set<string> = new Set();
  const uniqueEvents: FiscalMonthEvent[] = [];

  for (let event of events) {
    const eventDateStr = event.start.toISOString();
    if (!seenDates.has(eventDateStr)) {
      seenDates.add(eventDateStr);
      uniqueEvents.push(event);
    }
  }

  return uniqueEvents;
};

const getFiscalStartDate = (visibleDate: Date) => {
  const baseDate = new Date(2023, 8, 17);
  const daysDifference = Math.floor(
    (visibleDate.getTime() - baseDate.getTime()) / (1000 * 3600 * 24)
  );
  const fiscalDaysOffset = daysDifference % 28;
  const fiscalStartDate = new Date(visibleDate);
  fiscalStartDate.setDate(visibleDate.getDate() - fiscalDaysOffset);
  return fiscalStartDate;
};

const eventStyleGetter = (event: FiscalMonthEvent) => {
  let backgroundColor = "#f0f0f0";
  if (event.weekNumber === 1) {
    backgroundColor = "#f4cccc";
  } else if (event.weekNumber === 2) {
    backgroundColor = "#fce5cd";
  } else if (event.weekNumber === 3) {
    backgroundColor = "#fff2cc";
  } else if (event.weekNumber === 4) {
    backgroundColor = "#d9ead3";
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

const ordinal = (i: number) => {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return i + "st";
  }
  if (j === 2 && k !== 12) {
    return i + "nd";
  }
  if (j === 3 && k !== 13) {
    return i + "rd";
  }
  return i + "th";
};
