package com.datacenter.workingpermit.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkingPermitRequest {

    @NotBlank(message = "Visit purpose is required")
    private String visitPurpose;

    @NotNull(message = "Visit type is required")
    private String visitType;

    @NotNull(message = "Data center is required")
    private String dataCenter;

    @NotNull(message = "PIC ID is required")
    private Long picId;

    @NotNull(message = "Scheduled start time is required")
    private LocalDateTime scheduledStartTime;

    @NotNull(message = "Scheduled end time is required")
    @Future(message = "Scheduled end time must be in the future")
    private LocalDateTime scheduledEndTime;

    private List<String> equipmentList;

    private String workOrderDocument;
}
