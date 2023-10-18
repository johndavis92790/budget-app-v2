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
  const [date, setDate] = useState(new Date());

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
        date={date}
        onNavigate={(newDate: string | number | Date) =>
          setDate(new Date(newDate))
        }
        events={getFiscalMonthEvents(date)}
      />
    </div>
  );
};

const getFiscalMonthEvents = (visibleDate: Date) => {
  const events = [];

  // Find the start of the fiscal month of the visibleDate
  let fiscalStartDate = getFiscalStartDate(visibleDate);

  // To cover the entire visible calendar month, generate events 
  // for the previous, current, and next fiscal month.
  for (let monthOffset = -1; monthOffset <= 1; monthOffset++) {
    let offsetDate = new Date(fiscalStartDate);
    offsetDate.setDate(fiscalStartDate.getDate() + monthOffset * 28);
    let fiscalDate = new Date(offsetDate);
    
    for (let i = 0; i < 4; i++) {
      events.push({
        title: `${ordinal(i + 1)} Week`,
        start: new Date(fiscalDate),
        end: new Date(
          fiscalDate.getFullYear(),
          fiscalDate.getMonth(),
          fiscalDate.getDate() + 7
        ),
        allDay: true,
        weekNumber: i + 1,
      });
      fiscalDate.setDate(fiscalDate.getDate() + 7);
    }
  }

  return events;
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
