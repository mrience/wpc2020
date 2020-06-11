# Zaliczenie przedmiotu Wirtualizacja i przetwarzanie w chmurze

Autor: Mateusz Kućka (193574) (WZISS22412IS)

## Projekt, impplementacja oraz wdrożenie aplikacji w środowisku AWS

Applikacja generująca animację ze zdjęć, wdrożona z wykorzystaniem usług dostępnych w obrębie chmury AMAZON

### Wymagania dotyczące funkcjonalności

* Rejestracja użytkownika
* Autoryzacja dostępu do aplikacji
* Autoryzacja dostepu do zasobów
* Przechowywanie plików
* Integracja z wykorzystaniem HTTP
* Integracja z wykorzystaniem serwera kolejki
* Implementacja właściwej transformacji obrazów do video
* Notyfikacja użytkownika o zakończonym procesie

### Usługi wspomagające realizacje wymagań

* Amazon Cognito -> rejestracja oraz zarządzanie użytkownikami
* Simple Email Service -> wysyłanie maila o stworzonej animacji
* S3 -> przechowywanie plików
* CloudWatch -> logowanie i pomoc w debugowaniu
* Simple Queue Service -> kolejka do animacji i notyfikacji 
* Cloud9 -> IDE
* Lambda -> tworzenie funkcji do przyjmowania zdjęć, wysyłania do kolejki, tworzenia animacji i wysyłania notyfikacji na maila
* API Gateway -> API REST do integracji z funkcjami Lambda

### Charakterysytka modułów aplikacji
Wykorzystanie technologie, sposób integracji, opis funkcjonalności

* UI
    - javascript(webpack), html, css
    - integracja z API Gateway(REST API) 
    - integracja z Amazon Cognito(rejestracja, logowanie)
    - integracja z S3 - przechowywanie plików, pobieranie
* Transcoding
    - python
    - kolejka do przechowywania informacji o obrazach
    - integracja z API Gateway do odbierania requestów z UI
    - integracja z S3 - przechowywanie plików, pobieranie
    - integracja z kolejką order animation, gdzie kolejka wywołuje funkcje create-slideshow tworzącą animacje 
* Notyfikacje
    - python
    - kolejka do przechowywania informacji o notyfikacjach
    - integracja z kolejką orders-notifications, gdzie kolejka wywołuje funkcje notify wysyłającą notyfikacje na maila
    - integracja z Simple Email Service do wysyłania maili

## Wady i zalety wdrożenia z wykorzystaniem chmury

+ Skalowalność
+ Niskie koszty
+ Elastyczność konfiguracji
+ Brak potrzeby własnych zasobów

- Bezpieczeństwo
- Skomplikowanie
- Kontrola


## Wykorzystane uslugi

* Bucket -> https://s3.console.aws.amazon.com/s3/buckets/193574/
* API Gateway -> https://du9c3cp0kh.execute-api.eu-west-1.amazonaws.com/dev - 193574
* Lambda (zlecenie przygotowania animacji) -> 193574-order-animation
* Kolejka (zlecenia do wykonania) -> https://sqs.eu-west-1.amazonaws.com/881078108084/193574-order-animation - 193574-order-animation
* Lambda (transcoding) -> 193574-create-slideshow
* Kolejka (notyfikacje do wysłania) -> https://sqs.eu-west-1.amazonaws.com/881078108084/193574-order-notification - 193574-orders-notifications
* Lambda (notyfikacja) -> 193574-notify

