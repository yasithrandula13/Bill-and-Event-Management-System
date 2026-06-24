package com.billevent.eventbillreminder.controller;

import com.billevent.eventbillreminder.model.Bill;
import com.billevent.eventbillreminder.service.BillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping
    public List<Bill> getAllBills() {
        return billService.getAllBills();
    }

    @GetMapping("/{id}")
    public Bill getBillById(@PathVariable Long id) {
        return billService.getBillById(id);
    }

    @PostMapping
    public Bill createBill(@RequestBody Bill bill) {
        if (bill.getStatus() == null) bill.setStatus("unpaid");
        return billService.saveBill(bill);
    }

    @PutMapping("/{id}")
    public Bill updateBill(@PathVariable Long id, @RequestBody Bill bill) {
        return billService.updateBill(id, bill);
    }

    @DeleteMapping("/{id}")
    public void deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
    }

    @PatchMapping("/{id}/status")
    public Bill updateBillStatus(@PathVariable Long id, @RequestBody String status) {
        Bill bill = billService.getBillById(id);
        if (bill != null) {
            bill.setStatus(status.replace("\"", ""));
            return billService.saveBill(bill);
        }
        return null;
    }
}
