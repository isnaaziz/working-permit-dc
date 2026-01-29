package com.datacenter.workingpermit.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApprovalRequest {

    @NotNull(message = "Permit ID is required")
    private Long permitId;

    @NotNull(message = "Approval decision is required")
    private Boolean approved;

    private String comments;
}
