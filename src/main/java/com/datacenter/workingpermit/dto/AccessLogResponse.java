package com.datacenter.workingpermit.dto;

import com.datacenter.workingpermit.model.AccessLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for AccessLog responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccessLogResponse {

    private Long id;
    private Long permitId;
    private String permitNumber;
    private Long userId;
    private String visitorName;
    private String visitorEmail;
    private String company;
    private String accessType;
    private String location;
    private LocalDateTime timestamp;
    private String status;
    private String remarks;
    private String deviceId;
    private String dataCenter;

    /**
     * Create AccessLogResponse from AccessLog entity
     */
    public static AccessLogResponse fromEntity(AccessLog log) {
        if (log == null)
            return null;

        return AccessLogResponse.builder()
                .id(log.getId())
                .permitId(log.getWorkingPermit() != null ? log.getWorkingPermit().getId() : null)
                .permitNumber(log.getWorkingPermit() != null ? log.getWorkingPermit().getPermitNumber() : null)
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .visitorName(log.getUser() != null ? log.getUser().getFullName() : null)
                .visitorEmail(log.getUser() != null ? log.getUser().getEmail() : null)
                .company(log.getUser() != null ? log.getUser().getCompany() : null)
                .accessType(log.getAccessType() != null ? log.getAccessType().name() : null)
                .location(log.getLocation())
                .timestamp(log.getTimestamp())
                .status(log.getStatus() != null ? log.getStatus().name() : null)
                .remarks(log.getRemarks())
                .deviceId(log.getDeviceId())
                .dataCenter(log.getWorkingPermit() != null && log.getWorkingPermit().getDataCenter() != null
                        ? log.getWorkingPermit().getDataCenter().name()
                        : null)
                .build();
    }
}
