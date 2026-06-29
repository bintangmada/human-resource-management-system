package com.hrms.enterprise.travel.repository;

import com.hrms.enterprise.travel.entity.TravelExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelExpenseRepository extends JpaRepository<TravelExpense, Long> {
    List<TravelExpense> findByTravelRequestId(Long travelRequestId);
}
