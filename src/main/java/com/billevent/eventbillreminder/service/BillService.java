package com.billevent.eventbillreminder.service;

import com.billevent.eventbillreminder.model.Bill;
import com.billevent.eventbillreminder.repository.BillRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BillService {

    private final BillRepository billRepository;

    public BillService(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    public Bill saveBill(Bill bill) {
        return billRepository.save(bill);
    }

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    public Bill getBillById(Long id) {
        return billRepository.findById(id).orElse(null);
    }

    public Bill updateBill(Long id, Bill bill) {
        Bill existing = getBillById(id);
        if (existing != null) {
            existing.setName(bill.getName());
            existing.setCategory(bill.getCategory());
            existing.setAmount(bill.getAmount());
            existing.setDueDate(bill.getDueDate());
            existing.setStatus(bill.getStatus());
            existing.setReminderDate(bill.getReminderDate());
            return billRepository.save(existing);
        }
        return null;
    }

    public void deleteBill(Long id) {
        billRepository.deleteById(id);
    }
}
