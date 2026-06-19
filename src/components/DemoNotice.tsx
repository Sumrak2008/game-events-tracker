export function DemoNotice() {
  return (
    <div className="card flex items-start gap-3 border-amber-400/30 bg-amber-400/5 p-4 text-sm">
      <span aria-hidden="true" className="text-lg leading-none">
        !
      </span>
      <p className="text-amber-100/90">
        <span className="font-semibold text-amber-200">
          Не все данные подтверждены официально.
        </span>{" "}
        Записи с пометкой «Демо-данные» демонстрационные или содержат
        ориентировочные даты. Подтвержденные записи показываются без этой
        пометки; детали проверки указаны на странице записи.
      </p>
    </div>
  );
}
