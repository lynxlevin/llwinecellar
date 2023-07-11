from enum import IntEnum


class Country(IntEnum):
    # Europe
    FRANCE = 101
    ITALY = 102
    GERMANY = 103
    LUXEMBOURG = 104
    SPAIN = 105
    PORTUGAL = 106
    SWITZERLAND = 107
    AUSTRIA = 108
    ENGLAND = 109
    # Central & Southeast Europe
    HUNGARY = 200
    BULGARIA = 201
    SLOVENIA = 202
    CROATIA = 203
    BOSNIA_HERZEGOVINA = 204
    MACEDONIA = 205
    SERBIA = 206
    MONTENEGRO = 207
    CZECH_REPUBLIC = 208
    SLOVAK_REPUBLIC = 209
    ROMANIA = 210
    MALTA = 211
    GREECE = 212
    # Asia & Old Russian Empire
    JAPAN = 301
    ARMENIA = 302
    GEORGIA = 303
    MOLDOVA = 304
    RUSSIA = 305
    UKRAINE = 306
    # America
    AMERICA = 401
    MEXICO = 402
    CANADA = 403
    CHILE = 404
    ARGENTINA = 405
    BRAZIL = 406
    URUGUAY = 407
    # Oceania
    AUSTRALIA = 501
    NEW_ZEALAND = 502
    # Eastern Meditarranean & Africa
    CYPRUS = 601
    ISRAEL = 602
    LEBANON = 603
    TURKEY = 604
    NORTH_AFRICA = 605
    SOUTH_AFRICA = 606

    @property
    def label(cls):
        return cls.name.replace("_", " ").title()

    @classmethod
    def from_label(cls, label):
        return cls[label.replace(" ", "_").upper()]

    @classmethod
    def choices_for_model(cls):
        return tuple((c.value, c.label) for c in cls)

    @classmethod
    def choices_for_serializer(cls):
        return tuple((c.label, c.label) for c in cls)
