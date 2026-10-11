package com.typingiq.entity;

public class SessionSecondTelemetry {

    private Integer secondMarker;
    private Double instantWpm;
    private Double instantAccuracy;
    private Integer cumulativeErrors;

    public SessionSecondTelemetry() {}

    public SessionSecondTelemetry(Integer secondMarker, Double instantWpm, Double instantAccuracy, Integer cumulativeErrors) {
        this.secondMarker = secondMarker;
        this.instantWpm = instantWpm;
        this.instantAccuracy = instantAccuracy;
        this.cumulativeErrors = cumulativeErrors;
    }

    public Integer getSecondMarker() { return secondMarker; }
    public void setSecondMarker(Integer secondMarker) { this.secondMarker = secondMarker; }
    public Double getInstantWpm() { return instantWpm; }
    public void setInstantWpm(Double instantWpm) { this.instantWpm = instantWpm; }
    public Double getInstantAccuracy() { return instantAccuracy; }
    public void setInstantAccuracy(Double instantAccuracy) { this.instantAccuracy = instantAccuracy; }
    public Integer getCumulativeErrors() { return cumulativeErrors; }
    public void setCumulativeErrors(Integer cumulativeErrors) { this.cumulativeErrors = cumulativeErrors; }
}
