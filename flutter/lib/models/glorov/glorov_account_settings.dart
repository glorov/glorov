/// Customer Account Preferences & Settings Model
class GlorovAccountSettings {
  final bool emailNotifications;
  final bool seasonalGardeningAlerts;
  final bool promotionalAlerts;
  final String preferredLanguage;
  final String measurementUnits;
  final String themeMode; // 'system', 'light', 'dark'

  const GlorovAccountSettings({
    this.emailNotifications = true,
    this.seasonalGardeningAlerts = true,
    this.promotionalAlerts = false,
    this.preferredLanguage = 'English',
    this.measurementUnits = 'Metric (cm, ml, °C)',
    this.themeMode = 'light',
  });

  GlorovAccountSettings copyWith({
    bool? emailNotifications,
    bool? seasonalGardeningAlerts,
    bool? promotionalAlerts,
    String? preferredLanguage,
    String? measurementUnits,
    String? themeMode,
  }) {
    return GlorovAccountSettings(
      emailNotifications: emailNotifications ?? this.emailNotifications,
      seasonalGardeningAlerts:
          seasonalGardeningAlerts ?? this.seasonalGardeningAlerts,
      promotionalAlerts: promotionalAlerts ?? this.promotionalAlerts,
      preferredLanguage: preferredLanguage ?? this.preferredLanguage,
      measurementUnits: measurementUnits ?? this.measurementUnits,
      themeMode: themeMode ?? this.themeMode,
    );
  }

  Map<String, dynamic> toJson() => {
        'emailNotifications': emailNotifications,
        'seasonalGardeningAlerts': seasonalGardeningAlerts,
        'promotionalAlerts': promotionalAlerts,
        'preferredLanguage': preferredLanguage,
        'measurementUnits': measurementUnits,
        'themeMode': themeMode,
      };

  factory GlorovAccountSettings.fromJson(Map<String, dynamic> json) {
    return GlorovAccountSettings(
      emailNotifications: json['emailNotifications'] as bool? ?? true,
      seasonalGardeningAlerts: json['seasonalGardeningAlerts'] as bool? ?? true,
      promotionalAlerts: json['promotionalAlerts'] as bool? ?? false,
      preferredLanguage: json['preferredLanguage'] as String? ?? 'English',
      measurementUnits:
          json['measurementUnits'] as String? ?? 'Metric (cm, ml, °C)',
      themeMode: json['themeMode'] as String? ?? 'light',
    );
  }

  static const GlorovAccountSettings defaults = GlorovAccountSettings();
}
