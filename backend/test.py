const groupedProcedures = selectedNames.reduce((acc, item) => {
    item.procedures.forEach((procedure) => {
      if (procedure.status !== TREATMENT_PLAN) {
        if (!acc[procedure.encounterDate]) {
          acc[procedure.encounterDate] = [];
        }
        acc[procedure.encounterDate].push(procedure);
      }
    });
    return acc;
  }, {});