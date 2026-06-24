package com.billevent.eventbillreminder.controller;

import com.billevent.eventbillreminder.model.Bill;
import com.billevent.eventbillreminder.model.Event;
import com.billevent.eventbillreminder.service.BillService;
import com.billevent.eventbillreminder.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final BillService billService;
    private final EventService eventService;

    public DashboardController(BillService billService, EventService eventService) {
        this.billService = billService;
        this.eventService = eventService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        Map<String, Object> response = new HashMap<>();

        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);

        // ✅ Get upcoming bills
        List<Bill> upcomingBills = billService.getAllBills().stream()
                .filter(b -> b.getDueDate() != null &&
                        (b.getDueDate().isAfter(today.minusDays(1)) && b.getDueDate().isBefore(nextWeek.plusDays(1))))
                .collect(Collectors.toList());

        // ✅ Get upcoming events
        List<Event> upcomingEvents = eventService.getAllEvents().stream()
                .filter(e -> e.getEventDateTime() != null &&
                        (e.getEventDateTime().toLocalDate().isAfter(today.minusDays(1)) &&
                                e.getEventDateTime().toLocalDate().isBefore(nextWeek.plusDays(1))))
                .collect(Collectors.toList());

        response.put("upcomingBills", upcomingBills);
        response.put("upcomingEvents", upcomingEvents);

        return ResponseEntity.ok(response);
    }
}
