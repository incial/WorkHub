package com.incial.workhub.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {

    //error handling
    private int statusCode;
    private String message;

    private String role;
    private String token;

    //CRM
    private String company;
    private String phone;
    private String email;

    private String contactName;
    private String assignedTo;

    private LocalDate lastContact;
    private LocalDate nextFollowUp;

    private BigDecimal dealValue;

    private String notes;

    private List<String> tags;
    private List<String> work;
    private List<String> status;
    private List<String> leadSources;
}
