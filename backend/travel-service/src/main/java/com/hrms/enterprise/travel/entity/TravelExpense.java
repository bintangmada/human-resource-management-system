package com.hrms.enterprise.travel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "travel_expenses", schema = "hrms_travel")
public class TravelExpense extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_request_id", nullable = false)
    @JsonIgnore
    private TravelRequest travelRequest;

    @Column(name = "expense_type", nullable = false)
    private String expenseType; // FLIGHT, HOTEL, MEALS, TRANSPORT, OTHER

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "receipt_url")
    private String receiptUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * PENDING, APPROVED, REJECTED
     */
    @Column(nullable = false)
    private String status = "PENDING";

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TravelRequest getTravelRequest() { return travelRequest; }
    public void setTravelRequest(TravelRequest travelRequest) { this.travelRequest = travelRequest; }
    public String getExpenseType() { return expenseType; }
    public void setExpenseType(String expenseType) { this.expenseType = expenseType; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getReceiptUrl() { return receiptUrl; }
    public void setReceiptUrl(String receiptUrl) { this.receiptUrl = receiptUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
