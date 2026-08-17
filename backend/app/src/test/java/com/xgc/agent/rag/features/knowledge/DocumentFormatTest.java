package com.xgc.agent.rag.features.knowledge;

import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.features.knowledge.detect.DocumentFormat;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DocumentFormatTest {

    @Test
    void mapsCanonicalMime() {
        assertThat(DocumentFormat.fromCanonicalMediaType("application/pdf")).isEqualTo(DocumentFormat.PDF);
        assertThat(DocumentFormat.fromCanonicalMediaType("image/jpeg")).isEqualTo(DocumentFormat.JPEG);
        assertThat(DocumentFormat.fromCanonicalMediaType("text/markdown")).isEqualTo(DocumentFormat.MARKDOWN);
    }

    @Test
    void aliasMime_notAcceptedHere() {
        // 别名须先经 MediaTypeDetector 归一；本方法只认规范 MIME
        assertThatThrownBy(() -> DocumentFormat.fromCanonicalMediaType("application/x-pdf"))
                .isInstanceOf(WebAdminException.class);
    }
}
